exports = {
  // args is a JSON block containing the payload information.
  // args['iparam'] will contain the installation parameter values.
  onConversationCreateHandler: async function(args){
    const noteData = args["data"]["conversation"];
    if(noteData.private==true){
      try{
        await $request.invokeTemplate("onCreatingPrivateNote",{
          context:{},
          body:JSON.stringify(
            {
              parent:{
                type:"database_id",
                database_id:"<%=iparam.notion_database%>"
              },
              properties:{
                Name:{
                  title:[
                    {
                      type:"text",
                      text:{
                        content: "TICKET #"+noteData["ticket_id"]
                      }
                    }
                  ]
                }
              },
              children:[
                {
                  object:"block",
                  type:"paragraph",
                  paragraph:{
                    rich_text:[
                      {
                        text:{
                          content:noteData["body_text"]
                        }
                      }
                    ]
                  }
                }
              ]
            }
          )
        })
        console.log("Notes added successfully to the notion :) ");
      }catch(error){
        console.log(error);
      }
    }else{
      console.log("Note is not private");
    }
  }
}
