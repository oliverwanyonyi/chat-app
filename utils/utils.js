export const getUsersConnected = (ids,users) =>{
  
    const activeMembers = [];

      for (const id of ids){
        if(users.get(id)){
          activeMembers.push(users.get(id).socketId)
        }
      }
      return {activeMembers}
}