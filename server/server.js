exports = {
  // args is a JSON block containing the payload information.
  // args['iparam'] will contain the installation parameter values.
  // onTicketCreateHandler: function(args) {
  //   const requesterData = args['data']['requester'];
  //   const agentData = args['data']['actor'];
  //   console.log('Welcome to freshdesk \n' + JSON.stringify(requesterData)+'\n'+JSON.stringify(agentData));
  // }

  onConversationCreateHandler: function(args){
    const noteData = args['data']['conversation'];
    if(noteData.private==true){
      
    };
  }
};
