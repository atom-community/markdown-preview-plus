# Installation

1.  **Install MPP**

    Search for **Markdown Preview Plus** in the menu **File &rsaquo; Settings
    &rsaquo; Install** and click **Install**. Please allow 3-5 mins for
    installation. Alternatively if you would prefer to use the command line
    utility `apm`:

    ````bash
    apm install markdown-preview-plus
    ````

2.  **Install mathjax-wrapper**

    Search for **mathjax-wrapper** in the menu **File &rsaquo; Settings &rsaquo;
    Install** and click **Install**. Please allow 10-15 mins for installation
    of mathjax-wrapper. Alternatively if you would prefer to use the command
    line utility `apm`:

    ````bash
    apm install mathjax-wrapper
    ````

3.  **Disable Markdown Preview**

    Disable the built in Markdown Preview package. You can do this by searching
    for **Markdown Preview** in the menu **File &rsaquo; Settings &rsaquo;
    Packages** and clicking **Disable**.

4.  **(Optional) Enable Pandoc**

    Optionally you may use Pandoc to render the Markdown preview. To enable
    Pandoc within MPP:

    1.  [Install pandoc](http://pandoc.org/installing.html)
    2.  Run `which pandoc` and note the full path to the Pandoc executable.
    3.  On the MPP settings page enable **Enable Pandoc Parser**
    4.  Enter the path from step 2 into **Pandoc Options: Path**
