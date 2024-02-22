import { clamp } from "./util.mjs";

// set as event listener to stop propagation
function dontPropagate(e) {
    e.stopPropagation();
}

// the fake windows are draggable
function onDragDown(event, box) {
    event.preventDefault();

    const offsetX = event.clientX - box.offsetLeft;
    const offsetY = event.clientY - box.offsetTop;
    const onDragging = (e) => {
        e.preventDefault();
        box.style.left = `${e.clientX - offsetX}px`;
        box.style.top = `${e.clientY - offsetY}px`;
    };

    const onDragUp = (e) => {
        e.preventDefault();
        window.removeEventListener("pointermove", onDragging);
        window.removeEventListener("pointerup", onDragUp);
    };

    window.addEventListener("pointermove", onDragging);
    window.addEventListener("pointerup", onDragUp);
}

function makeTitleBar(windowDiv, title) {
    const titleBarDiv = document.createElement("div");
    titleBarDiv.classList.add("title-bar");
    titleBarDiv.addEventListener("pointerdown", (e) =>
        onDragDown(e, windowDiv)
    );

    const titleBarTextDiv = document.createElement("div");
    titleBarTextDiv.classList.add("title-bar-text");
    titleBarTextDiv.append(title);
    titleBarTextDiv.addEventListener("pointerdown", dontPropagate);
    titleBarDiv.append(titleBarTextDiv);

    return titleBarDiv;
}

function makeButton(ariaLabel, clickFunc, styleClasses = []) {
    const button = document.createElement("button");
    button.setAttribute("aria-label", ariaLabel);

    button.addEventListener("pointerdown", dontPropagate);
    button.addEventListener("click", clickFunc);

    button.classList.add(...styleClasses);

    return button;
}

function addContentText(item, dest) {
    const newText = document.createElement("p");
    newText.innerHTML = item;
    newText.addEventListener("click", dontPropagate);
    dest.append(newText);
}

function addContentButton(item, dest) {
    const button = document.createElement("button");
    button.classList.add(...(item.styleClasses || []));

    if (item.disabled) {
        button.setAttribute("disabled", "");
    }
    button.append(item.text);

    button.addEventListener("click", item.clickFunc);

    dest.append(button);
}

function parseContent(item, dest) {
    // text
    if (typeof item == "string") {
        addContentText(item, dest);
    }
    if (typeof item == "object") {
        if (item.type == "div") {
            const containerDiv = document.createElement("div");
            containerDiv.classList.add(...(item.styleClasses || []));

            item.content.forEach((i) => parseContent(i, containerDiv));
            dest.append(containerDiv);
        }
        if (item.type == "button") {
            addContentButton(item, dest);
        }
    }
}

function renderContentTo(contentToAdd, where) {
    if (typeof contentToAdd === "string") {
        addContentText(contentToAdd, where);
    } else if (Array.isArray(contentToAdd)) {
        contentToAdd.forEach((i) => parseContent(i, where));
    }
}

function dialogMoveTo(box, x, y) {
    box.style.left = `${x}px`;
    box.style.top = `${y}px`;
}

/**
 * creates a dialog window with MANY options.
 * all of them are optional save for the options object itself.
 * reasonable defaults will be used
 */
function dialogCreate({
    width = 250,
    position = null,
    title = "",
    minimize = false,
    maximize = false,
    minimizeFunc = null,
    maximizeFunc = null,
    closeFunc = null,
    content = null,
    tabs = null,
}) {
    // window
    const windowDiv = document.createElement("div");
    windowDiv.classList.add("window", "fades-in");
    windowDiv.style.width = `${width.toString()}px`;
    windowDiv.style.zIndex = 1;
    // cancel fadein and put the window on top if clicked
    document.body.addEventListener("pointerdown", (e) => {
        // HACK: rethink window focus emulation so this isn't needed!!!
        if (e.target.nodeName === "A" || e.target.getAttribute("role") === "tab") {
            return;
        }

        if (windowDiv.contains(e.target)) {
            windowDiv.classList.remove("fades-in");
            windowDiv.parentNode.append(windowDiv);
        }
    });

    // title bar
    const titleBarDiv = makeTitleBar(windowDiv, title);
    windowDiv.append(titleBarDiv);

    const titleBarControlsDiv = document.createElement("div");
    titleBarControlsDiv.classList.add("title-bar-controls");
    titleBarDiv.append(titleBarControlsDiv);

    // the little buttons on the right of the title bar
    // minimize and maximize are optional
    if (minimize) {
        const minimizeButton = makeButton("Minimize", minimizeFunc);
        titleBarControlsDiv.append(minimizeButton);
    }
    if (maximize) {
        const maximizeButton = makeButton("Maximize", maximizeFunc);
        titleBarControlsDiv.append(maximizeButton);
    }

    // but there's always a close button
    const closeButton = makeButton("Close", () => {
        windowDiv.remove();
        closeFunc?.();
    });
    titleBarControlsDiv.append(closeButton);

    // the body of the window
    const windowBodyDiv = document.createElement("div");
    windowBodyDiv.classList.add("window-body");
    windowDiv.append(windowBodyDiv);

    if (tabs) {
        // tab list
        const tabListMenu = document.createElement("menu");
        tabListMenu.setAttribute("role", "tablist");

        // tab contents
        const tabPanelDiv = document.createElement("div");
        tabPanelDiv.classList.add("window");
        tabPanelDiv.setAttribute("role", "tabpanel");

        const tabPanelContentDiv = document.createElement("div");
        tabPanelContentDiv.classList.add("window-body");
        tabPanelDiv.append(tabPanelContentDiv);

        tabs.forEach((tab) => {
            const tabLi = document.createElement("li");
            tabLi.classList.add("tab-li");
            tabLi.setAttribute("role", "tab");

            const tabLiAnchor = document.createElement("a");
            tabLiAnchor.classList.add("tab-anchor");
            tabLiAnchor.setAttribute("href", "#");
            tabLiAnchor.append(tab.label);
            tabLi.append(tabLiAnchor);
            tabListMenu.append(tabLi);

            // this div will hold everything that's supposed to be "in" this tab
            const containerDiv = document.createElement("div");
            renderContentTo(tab.content, containerDiv);
            tabPanelContentDiv.append(containerDiv);

            const tabContentElement = tabPanelContentDiv.lastElementChild;
            tabLi.addEventListener("click", (e) => {
                // select the tab
                [...tabListMenu.children].forEach(child => {
                    child.removeAttribute("aria-selected");
                });
                tabLi.setAttribute("aria-selected", "true");
                
                // show only the content in this tab
                [...tabPanelContentDiv.children].forEach((child) => child.style.display = "none");
                tabContentElement.style.removeProperty("display");
                return false;
            });
        });
        [...tabPanelContentDiv.children].forEach((child) => child.style.display = "none");

        // first tab is selected by default
        tabListMenu.firstElementChild.setAttribute("aria-selected", "true");
        tabPanelContentDiv.firstElementChild.style.removeProperty("display");


        windowBodyDiv.append(tabListMenu);
        windowBodyDiv.append(tabPanelDiv);
    } else {
        renderContentTo(content, windowBodyDiv);
    }

    // add to DOM
    const fakeWindowsDiv = document.getElementById("fakeWindows");
    fakeWindowsDiv.append(windowDiv);

    // position (relies on the elements being in the DOM already)
    // not specified, pick a random one that fits in the screen
    if (!position) {
        const maxX = window.innerWidth - windowDiv.offsetWidth;
        const maxY = window.innerHeight - windowDiv.offsetHeight;
        dialogMoveTo(windowDiv, maxX * Math.random(), maxY * Math.random());
    } else {
        dialogMoveTo(windowDiv, position.x, position.y);
    }

    return windowDiv;
}

// fake windows that end up outside the view as a result of a window resize
// are pushed back in to prevent scrollbars from appearing
window.addEventListener("resize", (event) => {
    const fakeWindowsDiv = document.getElementById("fakeWindows");

    [...fakeWindowsDiv.children].forEach((fakeWindow) => {
        const boundingRect = fakeWindow.getBoundingClientRect();

        dialogMoveTo(
            fakeWindow,
            clamp(boundingRect.x, 0, window.innerWidth - boundingRect.width),
            clamp(boundingRect.y, 0, window.innerHeight - boundingRect.height)
        );
    });
});

export { dialogCreate, dialogMoveTo };
