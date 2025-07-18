 const maximizedParams = {
     maxLength: 2560,
     minimumLength: 2560,
     height: 40,
     panelIds: [99]
 };
 const unmaximizedParams = {
     maxLength: 1000,
     minimumLength: 1000,
     height: 40,
     panelIds: [99]
 };

function sendPanelResize(params) {
    callDBus(
        "org.kde.plasmashell",
        "/PlasmaShell",
        "org.kde.PlasmaShell",
        "evaluateScript",
        `
        function setPanelProperties({maxLength, minimumLength, height, panelIds = []}) {
            print("Resize script called");


            var panelsList = panels();
            if (!panelsList.length) return;

            // Filter panels by matching ID
            var targetPanels = panelsList.filter(panel => panelIds.includes(panel.id));
            if (targetPanels.length === 0) {
                return;
            }

            targetPanels.forEach(panel => {
                panel.lengthMode = "custom";     // switch to custom-length mode

                // Flip-flopping length to force config reload
                panel.maximumLength = maxLength - 1;
                panel.maximumLength = maxLength;

                panel.minimumLength = minimumLength - 1;
                panel.minimumLength = minimumLength;

                // Flip-flopping height to force config reload
                panel.height = height - 1;
                panel.height = height;
            });
        }
        setPanelProperties(${JSON.stringify(params)});
        `
    );
}

sendPanelResize(unmaximizedParams)

const trackedWindows = new Set();
const maximizedWindows = new Set();

let primaryOutput = null;

for (let screen of workspace.screens) {
    if (screen.name === "DP-1") {
        primaryOutput = screen;
        break;
    }
}

if (!primaryOutput) {
    primaryOutput = workspace.screens[0];
}

// This connects to every new window added to KWin
workspace.windowAdded.connect(function(window) {

    trackedWindows.add(window);
    // this fires just _before_ any maximize/unmaximize
    window.maximizedAboutToChange.connect(function(mode) {
        if (mode === KWin.MaximizeFullArea) {
            if (window.output !== primaryOutput) {
                return;
            }
            maximizedWindows.add(window);
            sendPanelResize(maximizedParams);
        } else {
            maximizedWindows.delete(window);
            if (maximizedWindows.size === 0) {
                sendPanelResize(unmaximizedParams);
            }
        }
    });
});
