exports.appendBlock = async function appendBlock(data, body, bodyText) {
    const list = bodyText.split("  ");
    var res = getConditionResult(body);
    if (res == true && body.includes("to do") == true) { // for list type of content
        list.forEach(element => {
            data["children"].push({
                object: "block",
                type: "to_do",
                to_do: {
                    rich_text: [
                        {
                            type: "text",
                            text: {
                                content: element
                            }
                        }
                    ],
                    checked: false,
                    color: "default"
                }
            })
        });
    } else if (res == true) {
        list.forEach(element => {
            data["children"].push({
                object: "block",
                type: "bulleted_list_item",
                bulleted_list_item: {
                    rich_text: [
                        {
                            type: "text",
                            text: {
                                content: element
                            }
                        }
                    ]
                }
            })
        });
    } else { // for paragraph type of content
        data["children"].push({
            object: "block",
            type: "paragraph",
            paragraph: {
                rich_text: [
                    {
                        type: "text",
                        text: {
                            content: bodyText
                        }
                    }
                ]
            }
        })
    }
    // to add a divider between separate notes of the same ticket.
    data["children"].push({
        object: "block",
        type: "divider",
        divider: {}
    })
}

function getConditionResult(text) {
    if (text.includes("<ol>") == true || text.includes("<ul>") == true || text.includes("</li>") == true) {
        return true;
    } else {
        return false;
    }
}

exports.returnReadableDate = (timestamp) => {
    const date = new Date(timestamp);
    const options = {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true,
    }
    const readableDate = date.toLocaleString('en-US', options)
    console.log(readableDate);
    return readableDate;
}