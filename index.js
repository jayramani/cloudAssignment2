const express = require('express')
const bodyParser = require('body-parser')
const axios = require('axios')
const app = express()
const AWS = require('aws-sdk')

const PORT = 5000
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

AWS.config.update({
    region: 'us-east-1',
    accessKeyId:'ASIAWYDQIOYELSXCZGHO',
    secretAccessKey:'PCe7EhfwBLbfPqjRj7XDdOkH2XLRUxvdWw//nvyQ',
    sessionToken: 'FwoGZXIvYXdzEIn//////////wEaDJGrKzyYt4QdyT33XCLAAR0GiVHpN3BUJqFzVk+gDAVeQVaaCEW7rkBHs2C9FN/M/MvUb4lF7IwLxjfdUSgwfVInBK7czE5z08HSvLZVowIqbNeKcwbjOPeYqmjyGs251FECjN2rL2X6vT5oQiaY0duHAoKI96qhlGJM9t9v3/Ox9GGNLsc3guQVZbBcl6cMZm49NUGc0m2SCslSqEcijx51fJVC7EDa5T8RJ2/8FmTSKfRfAUZ359yPpoFhmeB0cbV+/EvhgQHChm2+6YzrAiiTmuWfBjItB2aIUF+33+n9gAG4ippELcJGqW2aWbP4XBWFV/+JrIeeCytYqgTyf1KCIobt'
});

const s3 = new AWS.S3();

const postStart = async () => {
    const resp = await axios.post('http://52.91.127.198:8080/start', {
        banner: "B00911903",
        ip: "34.204.61.232:5000"
    })
    console.log(resp.data);
    
}


// Making POST request to start endpoint
postStart();


app.post('/storedata', (req, res) => {
    const rData = req.body.data;
    console.log(rData);

    s3.upload({
        Bucket: 'csci5409-00911903',
        Key: 'file.txt',
        Body: rData
    }, function(err, data){
        if (err){
            res.status(500);
            console.log("Error in uploading file: ", err);
        }
        else{
            console.log("File uploaded Successfully", data.Location);
            const url = data.Location;
            res.status(200).send({s3uri : url})
        }
    })

});

// APPEND CONTENT TO THE FILE
app.post('/appenddata', (req, res) => {
    const bName = "csci5409-00911903";
    const keyName = "file.txt";

    const new_data = req.body.data.toString();
    if (new_data){
        s3.getObject({Bucket : bName, Key : keyName}, (err, data) => {
            if (err){
                console.log(err);
                res.status(500);
            } else {
                const oldContent = data.Body.toString();
                const updatedContent = oldContent + new_data;
                s3.putObject({
                    Bucket:bName,
                    Key:keyName,
                    Body:updatedContent
                }, (err, data) => {
                    if (err) {
                        res.status(500);
                        console.log(err);
                    } else {
                        console.log("File updated!")
                        res.sendStatus(200);
                    }
                })
            }
        })
    }
    else{
        res.send(500);
    }
})

app.post('/deletefile', (req, res) => {
    const get_params = {
        Bucket: "csci5409-00911903",
        Key: "file.txt"
    };

    s3.deleteObject(get_params, function(err, data) {
        if (err) {
            console.log("Error", err);
        } else {
            res.sendStatus(200);
            console.log("Success!", data);
        }
    })

})


// App server is listening
app.listen(PORT, (error) => {
    if (!error){
        console.log("Server is running on PORT: "+PORT)
    }
    else{
        console.log("Error Occured")
    }
})