let $ = require('jquery');
const fs = require('fs');
const {
    dialog
} = require("electron").remote;
var Dialogs = require('dialogs')

var listAdd = null;
var dataWords = null;
var wordMain = '';
var web3;



$('#button-connect').on('click', async function () {
    // get host name
    var res = confirm("You already sure to input this port!");
    if (res == true){
        var host = $('#IP').val();
        var enter = '\n';
        if (!host) {
            alert("Please input host in the text box!");
        }
        if (host.indexOf('http://') == -1) {
            if (host.indexOf('HTTP://') != -1) {
                host = host.replace("HTTP", "http");
            } else {
                host = 'http://' + host;
            }
        }
        process.stdout.write('HOST:' + host + enter);

        web3 = await util.web3SetProvider(host);

        await util.isConnected(web3);
    }
})



const refreshTable = function () {
    $('#contact-table').html(
        '<tr>' +
        '<th scope="row"></th>' + 
        '<td></td>' +
        '<td></td>' +
        '</tr>'
    )
}

const addEntry = async function (index, data, balance) {
    if (data) {
        let updateString = '<th scope="row">' + index + '</th><td>' + data + '</td><td>' + balance + '</td>';
        $('#contact-table').append('<tr>' + updateString + '/tr');
    }
}

const storeFile = function () {
    if (dataWords == null)
        return;

    fs.writeFileSync('Wallets', '');
    let storeData = dataWords[0];
    for (let i = 1; i < dataWords.length; i++) {
        storeData += '\n' + dataWords[i];
    }
    fs.appendFileSync('Wallets', storeData);
}

$('#signin').on('click', async () => {
    let words = $('#words').val()
    if (util.isMnemonic(words) == false) {
        $('#words').val('');
        $('#words').attr("placeholder", "Invalided words, type your answer again!");
    } else {
        alert("Sign in successful");
        wordMain = words;

        $('#addr').val(util.getAddress(wordMain));
        console.log("ADDRESS:" + util.getAddress(wordMain) + '\n');

        var balance = await util.web3GetBalance(web3, util.getAddress(wordMain));
        $('#balance').val(balance);
        console.log("BALANCE:" + balance + '\n');
    }
});


$('#signup').on('click', async () => {
    let words = util.generateNewMnemonic();
    $('#words').val(words);
    alert("Sign in successful");

    wordMain = words;

    $('#addr').val(util.getAddress(wordMain));
    console.log("ADDRESS:" + util.getAddress(wordMain) + '\n');

    var balance = await util.web3GetBalance(web3, util.getAddress(wordMain));
    $('#balance').val(balance);
    console.log("BALANCE:" + balance + '\n');
})

$('#createNewAddresses').on('click', async () => {
    console.log("*****CreateNewAddress*****")

    var number_add = $("#address_num").val();
    dataWords = util.createWallets(number_add);

    storeFile();

    listAdd = util.loadAddresses(dataWords);

    refreshTable();
    for(let i = 0; i < listAdd.length; i++){
        var balance = await util.web3GetBalance(web3, listAdd[i]);
        addEntry(i, listAdd[i], balance);
    }
});


const loadFileAddress = function (filePath, number_add, mode) {
    if (mode == 0) {
        // file store 12 words mnemonic
        let data = fs.readFileSync(filePath).toString();

        //alert(data);


        if (data.split(' ').length != 12)
            return false;

        listAdd = util.loadAddressFromWords(data, number_add);
        privateKeys = util.loadPrivateKeyFromWords(data, number_add);


        console.log("PrKey" + privateKeys);
        //alert(listAdd);
        //alert(privateKeys);
    } else {
        //alert("huuh");
        // file store private key
        let data = fs.readFileSync(filePath).toString().split('\n');

        privateKeys = [];
        listAdd = [];
        data.forEach((element, index) => {
            element = element.replace("0x","");
            if (element.length != 64){
                return false;
            }
            console.log("Check" + util.getAddressFromPrivateKey(element));
            listAdd.push(util.getAddressFromPrivateKey(element));
        })
    }
    return true;
}


document.getElementById("btn-readfile").addEventListener("click", () => {
    dialog.showOpenDialog(async (filename) => {
        if (filename === undefined) {
            console.log("No files were selected");
            return;
        }

        var number_add = $("#address_num").val();

        if ($("#radio0").is(":checked")) {
            loadFileAddress(filename[0],number_add,0);

            refreshTable();
            for(let i = 0; i < listAdd.length; i++){
                var balance = await util.web3GetBalance(web3, listAdd[i]);
                addEntry(i, listAdd[i], balance);
            }
        }

        else if ($("#radio1").is(":checked")) {
            loadFileAddress(filename[0],number_add,1);

            refreshTable();
            for(let i = 0; i < listAdd.length; i++){
                var balance = await util.web3GetBalance(web3, listAdd[i]);
                addEntry(i, listAdd[i], balance);
            }
        }

        
    })

}, false);


$('#get_balance').on('click', async () => {
    var add = $('#inputBalance').val();
    console.log("Input balance:" + add + '\n');

    var balance = await util.web3GetBalance(web3, add);
    $('#outputBalance').val(balance);
    console.log("BALANCE:" + balance + '\n');
})



$('#transfer').on('click', async () => {
    if (listAdd == null) {
        alert("Please load or create new addresses! ");
        return;
    }
    console.log("ADDRESS:" + util.getAddress(wordMain) + '\n');

    var nonce = await web3.eth.getTransactionCount(util.getAddress(wordMain));
    console.log("NONCE 1:" + nonce + '\n');

    var addrContract = $('#sendCoin').val();
    console.log(addrContract);
    

    /*
        '' : address of contract for transfer
    */

    var coin = $('#coin').val();


    console.log("Word Main:" + wordMain);
    let tx = await util.transfer(web3, addrContract, util.getAddress(wordMain), util.getPrivateKey(util.getWallet(wordMain)), listAdd, nonce, coin);
    util.web3SendSignedTransaction(web3, tx);

    var balance = await util.web3GetBalance(web3, util.getAddress(wordMain));
    $('#balance').val(balance);
    console.log("BALANCE:" + balance + '\n');
});

$('#collectToken').on('click', async () => {
    if (dataWords == null) {
        alert("Please load or create new addresses! ");
        return;
    }


    var nonce;
    var wallet;

    var addrContract = $('#colToken').val();
    console.log(addrContract);

    for (let i = 0; i < dataWords.length; i++) {

        wallet = util.getWallet(dataWords[i]);
        nonce = await web3.eth.getTransactionCount(util.getAddress(dataWords[i]));
        console.log("NONCE 2:" + nonce + '\n');

        /*
            '' : address of contract to transfer token
        */
        console.log("Word main:" + wordMain);

        tx = await util.collectToken(addrContract, nonce, util.getPrivateKey(wallet), util.getAddress(wordMain))

        await util.web3SendSignedTransaction(web3, tx);
    }


    var balance = await util.web3GetBalance(web3, util.getAddress(wordMain));
    $('#balance').val(balance);
    console.log("BALANCE:" + balance + '\n');
})


$('#collectCoin').on('click', async () => {
    if (listAdd == null) {
        alert("Please load or create new addresses! ");
        return;
    }

    let dialogs =Dialogs(); 
    dialogs.prompt('Address to collect coin', async function(addressCoin) {

        var nonce;
        var wallet;

        var addrContract = $('#sendCoin').val();
        console.log(addrContract);

        for (let i = 0; i < listAdd.length; i++) {

            nonce = await web3.eth.getTransactionCount(listAdd[i]);
            console.log("NONCE 2:" + nonce + '\n');

            /*
                '' : address of contract to transfer token
            */
            var balance = await util.web3GetBalance(web3, listAdd[i]);
            console.log("Each balance:" + balance);
            let tx = await util.collectCoin(web3, addrContract, listAdd[i], privateKeys[i], [addressCoin], nonce, balance);
            if (tx != "")
                await util.web3SendSignedTransaction(web3, tx);
        }
    })
})