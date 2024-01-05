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

exports.returnReadableDate = (timestamp1,timestamp2) => {
    const date1 = new Date(timestamp1);
    const date2 = new Date(timestamp2);

    const readableDate1 = date1.toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true,
    });

    const readableDate2 = date2.toLocaleString('en-US',{
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true,
    })
    console.log(readableDate1 + readableDate2);
    return `Created at ${readableDate1}, Modified at ${readableDate2}`;
}