#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use lambda_note_lib::{DocumentState, Html, Latex, Translator, HtmlTemplate};
use rouille::{start_server, Response};
use std::fs::File;
use std::{
  thread,
  fs,
  io::Write,
  path::{Path, PathBuf},
  process::{Command, Stdio},
};
use tauri::command;
use tauri::Manager;
use window_shadows::set_shadow;
use path_clean::PathClean;

fn translate<T: Translator + 'static>(source: &str, filename: &Path, translator: T) {
  if fs::write(filename, &translate_str(source, translator, false).0).is_err() {
    println!("Failed to translate and write to file");
  }
}

#[derive(serde::Serialize)]
pub struct Issues {
  warnings: Vec<String>,
  errors: Vec<String>,
}

#[derive(serde::Serialize)]
pub struct ExtensionInfo {
  nickname: String,
  canonical_name: String,
  description: String,
  version: String,
  is_safe: bool,
  supports_block: bool,
  supports_inline: bool,
  interests: Vec<String>,
}


fn translate_str<T: Translator + 'static>(source: &str, translator: T, safe: bool) -> (String, DocumentState) {
  let mut doc = DocumentState::new(translator);
  doc.set_safe_mode(safe);
  let result = doc.translate(source, "preview");

  println!(
    "errors:\n{}\nwarnings:{}",
    doc.errors.join("\n"),
    doc.warnings.join("\n")
  );

  (result, doc)
}

/// Invoke pandoc to translate between two formats
fn pandoc(tex_source: &str, output_file: &Path) {
  let path = output_file.to_str().unwrap();
  // spawn pandoc
  let process = match Command::new("pandoc")
    .stdin(Stdio::piped())
    .arg("-f")
    .arg("latex")
    .arg("-o")
    .arg(path)
    .spawn()
  {
    Err(why) => panic!("couldn't spawn pandoc: {}", why),
    Ok(process) => process,
  };

  match process.stdin.unwrap().write_all(tex_source.as_bytes()) {
    Err(why) => panic!("couldn't write to pandoc stdin: {}", why),
    Ok(_) => println!("sent tex source to pandoc"),
  }
}


fn get_extension_info(doc: &DocumentState) -> Vec<ExtensionInfo> {
  doc.extensions
    .iter()
    .map(|(name, extension)| {
      ExtensionInfo {
        nickname: name.clone(),
        canonical_name: extension.name(),
        description: extension.description(),
        version: extension.version(),
        is_safe: extension.is_safe(),
        supports_block: extension.supports_block(),
        supports_inline: extension.supports_inline(),
        interests: extension.interests(),
      }
    })
    .collect()
}

#[command]
fn translate_preview(source: &str, filepath: &str, template: &str, safe: bool) -> (Issues, Vec<ExtensionInfo>) {
  let translator = HtmlTemplate::new(template, true);
  let (output, doc) = translate_str(source, translator, safe);
  let extensions_info = get_extension_info(&doc);

  let mut issues = Issues {
    errors: doc.errors,
    warnings: doc.warnings,
  };

  if let Err(error) = fs::write(&Path::new(filepath), output) {
    issues
      .errors
      .push(format!("Failed to write to the preview file: {}", error))
  }

  (issues, extensions_info)
}

#[command]
fn open_editor(filename: &str) {
  let path = filename.to_string();
  thread::spawn(|| edit::edit_file(path));
}

#[command]
fn export(filename: &str, source: &str) {
  println!("EXPORT: given output path {}", filename);
  let filename = Path::new(filename);

  match filename.extension() {
    None => {
      println!("You need to have a file extension for the output file");
    }
    Some(extension) => match extension.to_str() {
      Some("tex") => translate(source, filename, Latex),
      Some("html") => translate(source, filename, Html),

      // The program will try to resolve non native output formats
      // by passing a tex file to pandoc.
      Some(extension_str) => {
        println!("No native support for .{} files", extension_str);
        println!("Generating a .tex file and forwarding it to pandoc");

        pandoc(&translate_str(source, Latex, false).0, filename);
      }

      None => {
        println!("You need to have a file extension for the output file");
      }
    },
  }
}

fn mimetype(path: &Path) -> Option<String> {
  Some(
    mime_guess::from_ext(path.extension()?.to_str()?)
      .first()?
      .to_string(),
  )
}

fn absolute_path(path: &Path, root_dir: Option<String>) -> Option<PathBuf> {
  let absolute_path = if path.is_absolute() {
      path.into()
  } else {
      let root_dir = root_dir?;
      Path::new(&root_dir).join(path).clean()
  };

  Some(absolute_path)
}


fn start_preview() {
  start_server("127.0.0.1:5432", move |request| {
    let path_str = &request.url()[1..]; // skip the first forwardslash
    let root_dir = request.get_param("root");
    
    if let Some(path) = absolute_path(Path::new(path_str), root_dir) {
      match File::open(&path) {
        Ok(file) => Response::from_file(mimetype(&path).unwrap_or_else(|| "".into()), file),
        Err(_) => Response::empty_404(),
      }
    } else {
      // we got a relative path but could not turn it into an absolute one
      Response::empty_400()
    }
  });
}

#[command]
fn read_file(path: &str) -> Option<String> {
  fs::read_to_string(path).ok()
}

#[command]
fn write_file(path: &str, contents: &str) -> bool {
  fs::write(path, contents).is_ok()
}

#[command]
fn create_dir(path: &str) -> bool {
  fs::create_dir_all(path).is_ok()
}

fn main() {
  thread::spawn(start_preview);
  tauri::Builder::default()
    .setup(|app| {
      let window = app.get_window("main").expect("Failed to get window ");
      set_shadow(&window, true).unwrap();
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![open_editor, read_file, write_file, export, translate_preview, create_dir])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
