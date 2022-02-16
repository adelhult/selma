export default helpText = `# Getting started guide
This is a short introduction to the  the markup language \lambdanote (lambda note), which is used in this editor. If you are already familiar with Markdown or Org-mode, you will no doubt feel at home.

Note: that this intro guide is actually written in \lambdanote so feel free to click the "edit" button in the top right corner to view the source text and play around with it yourself.

### Why should I use \lambdanote?
Compared to say Markdown, it is not obvious why you should prefer to use this markup language since they are so familiar. But if you want value the flexibility of having a powerful system…., metadata, more formatting options etc…

## Text and paragraphs
To start writing just type plain text as normal. Paragraphs are seperated using one or more blank lines. Like this for example:
---------- code ---------------
This is a paragraph of just plain text.

This is another paragraph because there 
is a blank line between them.
-------------------------------

## Formatting text
You can add different inline styles to your text. It can  **bold**, //italic//, ~~strikethrough~~, ==under==lined, __sub__scripted, and ^^super^^scripted. 

All formatting options work the same way, just surround your text a few special characters \endash two before and two after. In the case of bold it looks something like this: \**an example of bold text**. Here is the complete list of text styling:
---------- code -------------------------
Bold text:      **bold**
Italic:         //italic//
Underlined:     ==underlined==
Strikethrough:  ~~strikethrough~~
Superscripted:  ^^superscripted^^
Subscripted:    __subscripted__
-----------------------------------------

Also note that unlike in some other markup language you are fully able high==light== only parts of a single word. It is of course also possible to ==style **multiple** words== or whole paragraphs.

### Special symbols and escapes characters
If you for some reason want to write say multiple forwardslashes or asterisks without it beeing seen as special \lambdanote syntax you can use an escape character. Just add a backlash before \\\**this will not be bold**.

There are also a number of useful built-in special characters that also begin with a backslash. This includes greek letters like \lambda and \Omega as well as arrows like \Right and \up. The whole list includes all greek letters using the same name conventions as in LaTeX and these extra characters:
------- code ------------------------
\alpha  \beta   \gamma  \Gamma etc...

\endash \emdash
\right  \Right
\left   \Left
\up     \Up
\down   \Down
\*  \^  \_  \/  \\  \=  \~  \|  \:
--------------------------------------
## Headings
To add a bit of structure to your document it might be a good idea to add a few headings. To create a heading, start a line with one or more hashtags. Subheadings of different levels are created by using more hashtags.
---- code ----------
# A big heading
## A subheading
### Another, even smaller, subheading
--------------------

## Thematic breaks
Thematic breaks are another way to break up your text into different sections. In a web browser this will rendered as a vertical line but in PDFs and LaTeX output this will turn into page break. Thematic breaks are produced by starting a line with three or more equals signs, for example:
--------- code ----
some content

====================

a different sections
------------------

## Metadata
To provide additonal information about the document you can add metadata fields
----------------- code ----------
:: author = Eli Adelhult
:: date   = 2022
---------------------------------
## Extensions
Extension expressions allow you to you do more powerful things in a

### Math
The math extension allows you to typeset math using LaTeX syntax. This extension works both inline and as a block (what LaTeX would call \begin{equation}).
---- code --------
|math, E = mc^2 |
------------------
This would output: |math, E = mc^2 |.

A bit more advanced block example.
-------------------------- code
---- math
\varphi (n)=n\prod _{j=1}^{r}\left(1-{\frac {1}{p_{j}}}\right)
----
-------------------------------
Which outputs the following equation.
---- math
\varphi (n)=n\prod _{j=1}^{r}\left(1-{\frac {1}{p_{j}}}\right)
----

### Code
The code extension is used to add code to your document without it getting parsed as \lambdanote syntax as well as adding nice syntax highlighting to your code.

The code extension can be used both inline and as a block.
---- code --------
|code, content, language (optional)|
------------------

Just plain text:
--------------------------- code
----- code -----
This is will be displayed as code in a monospaced font.
----------------
---------------------------
Specify a language to get nice syntx highlighting
--------------------------- code
----- code, python -----
for x in range(10):
    print(x)
------------------------
---------------------------
It would ouput this:
----- code, python -----
for x in range(10):
    print(x)
------------------------


### Images
Images are added using the **img** extension.
---- code
|img, image file path , optional alt text|
-----

|img, https://upload.wikimedia.org/wikipedia/en/b/b9/MagrittePipe.jpg, The Treachery of Images|

If you want to writer a longer alt text you can use a block expression instead.
---------- code
---- img, path 
Here is an example of
a longer alt text.
----
--------------

### Links
----- code ---------
|link, url, optional label|
--------------------
|link, https://www.youtube.com/watch?v=dQw4w9WgXcQ, This is an example of a link|

If you skip the label the entire url will also be displayed |link, https://github.com/adelhult/lambda-note |.

If you want to change the color of links, you can do so by setting the metadata entry "link_color".

---- code
:: link_color = green
----
:: link_color = green
|link, https://www.youtube.com/watch?v=dQw4w9WgXcQ, This is green|

|hidden, resetting the link_color....|
:: link_color = blue

### Evaluate calculations

### Other built-in extensions
**Alias** is used to give another name to an extension. 
---- code
|alias, math, m|
----

**Conditional** allows you to only include a piece of \lambdanote code if certaint conditions are met.
------- code
---- conditional, platform = windows
This will only be seen if the 
document is compiled on a windows computer.
----
------------

**Escape** lets you escape a lot of text without needing to prepending backlashes to every problematic character.
------- code
---- escape
# this will note be a heading
**And this wil note be bold.**
----
------------
**Hidden** is very handy if you want to add some kind of comment to your document or perhaps temporarily remove big sections of your document without deleting it.
------ code
|hidden, this is hidden...| 
------

**Maketitle** works in the same way as maketitle does in LaTeX. It simply adds a title based on the metadata fields author, date and title.
---- code
|maketitle|
----

**raw** hej hej

# Exporting your document
\lambdanote has built-in support for HTML (web) and LaTeX output. However, if you have the tool pandoc installed this editor will automatically allow you to output in a few other formats such as PDF, Markdown, Word and Powerpoint files.

# Other resources
|link, https://github.com/adelhult/lambda-note, Link to \lambdanote source code repository|
`;
