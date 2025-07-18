function setPanelProperties({maxLength, minimumLength, height, panelIds = []}) {

    print("Resize script called")

    var panelsList = panels();
    if (panelsList.length === 0) {
        return;
    }

    // Filter panels by matching ID
    var targetPanels = panelsList.filter(panel => panelIds.includes(panel.id));
    if (targetPanels.length === 0) {
        return;
    }

    targetPanels.forEach(panel => {
        panel.lengthMode   = "custom";     // switch to custom-length mode

        //Flip-flopping length ensures panel config realod even if chosen user length is the same as the current length. (This is needed for vertical panels)
        panel.maximumLength = maxLength -1;
        panel.maximumLength = maxLength;

        panel.minimumLength = minimumLength -1;
        panel.minimumLength = minimumLength;

        //Flip-flopping height ensures panel config realod even if chosen user height is the same as the current height. (This is needed for horizontal panels)
        panel.height = height - 1;
        panel.height = height;
    })
}

