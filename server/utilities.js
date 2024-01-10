
exports.defaultParentBlock = async function (payload)  {
    const noteData = payload.data.conversation;

    const parentJSON = {
        parent: {
            type: "database_id",
            database_id: "<%=iparam.notion_database%>"
        },
        properties: {
            Name: {
                title: [{
                    type: "text",
                    text: {
                        content: "TICKET #" + noteData["ticket_id"]
                    }
                }]
            }
        }
    }

    return parentJSON
}

function returnReadableDate(timestamp)  {
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


exports.defaultChildBlock = async function(payload)  {
    const noteData = payload.data.conversation;
    
    let createdAt = returnReadableDate(noteData["created_at"]);
    let modifiedAt = returnReadableDate(noteData["updated_at"]);

    const childJSON = {
        children: [
            {
                object: "block",
                type: "paragraph",
                paragraph: {
                    rich_text: [
                        {
                            type: "text",
                            text: {
                                content: `Created at ${createdAt}, modified at ${modifiedAt}`
                            },
                            annotations: {
                                italic: true,
                                color: "gray"
                            }
                        }
                    ]
                }
            }
        ]
    }

    return childJSON
}

exports.appendBlock = async function appendBlock(data, body, bodyText) {
    const result = { ...data };
    const list = bodyText.split("  ");
    const isList = getIfList(body);
    const isTodoList = getIfList(body) && body.toLowerCase().includes("todo");
    
    if (isList && isTodoList) { // for list type of content
        list.forEach(element => {
            result["children"].push({
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
        return
    } else if (isList) {
        list.forEach(element => {
            result["children"].push({
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
        return
    } else { // for paragraph type of content
        result["children"].push({
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
        });

        // return result;
    }
    // to add a divider between separate notes of the same ticket.
    result["children"].push({
        object: "block",
        type: "divider",
        divider: {}
    })
}

function getIfList(text) {
    if (text.includes("<ol>") == true || text.includes("<ul>") == true || text.includes("</li>") == true) {
        return true;
    } else {
        return false;
    }
}
