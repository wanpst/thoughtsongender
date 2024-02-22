import { psychInit } from "./psych.mjs";
import { dialogCreate, dialogMoveTo } from "./dialog.mjs";
import { pickFromArray, randomBetween } from "./util.mjs";

function setupRandomPrompts() {
    const dayNames = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
    ];

    const dayOfWeek = dayNames[new Date().getDay()];

    const messageText = [
        "Do you like me?",
        "Do you like me?",
        "You stopped responding, I just thought",
        "Do you see me that way?",
        "It's not safe here",
        "doing it wrong",
        `on ${dayOfWeek}s i listen to myself`,
    ];

    const yesText = [
        "Yes",
        "Yeah",
        "YES",
        "yes",
        "yes!",
        "yes.",
        "Alright",
        "alright",
        "ALRIGHT",
        "Ok",
        "ok",
        "OK",
        "Okay",
        "okay",
        "OKAY",
        "iykyk",
        "it's within our reach",
        "i saw",
        "i saw it",
        "i do",
    ];

    const noText = [
        "No",
        "Nah",
        "NO",
        "no",
        "no!",
        "no.",
        "Abort",
        "abort",
        "ABORT",
        "Ignore",
        "ignore",
        "IGNORE",
        "Step",
        "step",
        "STEP",
        "No clue",
        "it's beyond us",
        "you weren't there",
        "didn't see you there",
        "i don't",
    ];

    const makeRandomPrompt = () => {
        dialogCreate({
            title: "Query",
            closeFunc: () =>
                setTimeout(makeRandomPrompt, randomBetween(3000, 6000)),
            content: [
                pickFromArray(messageText),
                {
                    type: "div",
                    styleClasses: ["field-row", "centered-field-row"],
                    content: [
                        {
                            type: "button",
                            text: pickFromArray(yesText),
                            disabled: true,
                        },
                        {
                            type: "button",
                            text: pickFromArray(noText),
                            disabled: true,
                        },
                    ],
                },
            ],
        });
    };
    setTimeout(makeRandomPrompt, randomBetween(3000, 6000));
}

function setupEyes() {}

document.addEventListener("DOMContentLoaded", (event) => {
    // for fun and games you can create dialog boxes from the console!
    window.dialogCreate = dialogCreate;
    window.dialogMoveTo = dialogMoveTo;

    const aboutButton = document.createElement("button");
    aboutButton.classList.add("about");
    aboutButton.appendChild(document.createTextNode("about"));
    aboutButton.addEventListener("click", () => {
        dialogCreate({
            title: "Data",
            position: { x: 0, y: 24 },
            tabs: [
                {
                    label: "this",
                    content:
                        'site by <a href="mailto:wanpcont@outlook.com">wanp</a>',
                },
                {
                    label: "98.css",
                    content: [
                        "Copyright 2020 Jordan Scales",
                        `Permission is hereby granted, free of charge, to any
                    person obtaining a copy of this software and associated
                    documentation files (the "Software"), to deal in the Software
                    without restriction, including without limitation the rights
                    to use, copy, modify, merge, publish, distribute, sublicense,
                    and/or sell copies of the Software, and to permit persons to
                    whom the Software is furnished to do so, subject to the following
                    conditions:`,

                        `The above copyright notice and this permission notice shall be
                    included in all copies or substantial portions of the Software.`,

                        `THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
                    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
                    OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
                    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
                    HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
                    WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
                    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
                    OTHER DEALINGS IN THE SOFTWARE.`,
                    ],
                },
            ],
        });
    });
    document.body.appendChild(aboutButton);

    psychInit();
    setupRandomPrompts();
    setupEyes();
});
