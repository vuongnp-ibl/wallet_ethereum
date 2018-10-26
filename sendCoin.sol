contract Send {

    function Send() public payable{

    }
    
    function () public payable{
    }
    
    function getBalance() constant returns (uint balance){
        balance = this.balance;
        return balance;
    }
    
    function transfer(address[] receiver, uint256 amount) payable public returns(bool){
        for(uint i = 0; i < receiver.length; i++){
            receiver[i].send(amount);
        }
        return true;
    }   
}