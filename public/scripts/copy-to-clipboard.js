function CopyToClipboard(options) {
    this._el = options.el;
    var button = this._el.querySelector("[data-copy]");
    var contentHolder = this._el.querySelector("[data-holder]");

    button.addEventListener("click", function() {

        // We will need a range object and a selection.
        var range = document.createRange(),
            selection = window.getSelection();

        // Clear selection from any previous data.
        selection.removeAllRanges();

        // Make the range select the entire content of the contentHolder paragraph.
        range.selectNodeContents(contentHolder);

        // Add that range to the selection.
        selection.addRange(range);

        // Copy the selection to clipboard.
        document.execCommand('copy');

        // Clear selection if you want to.
        selection.removeAllRanges();

    }, false);
}