const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
const AWS = require('aws-sdk');

const PORT = 5000

app.use(express.json());

AWS.config.update({
    region: 'us-east-1',
    accessKeyId:'ASIAWYDQIOYENRSFXRXI',
    secretAccessKey:'nbaf4OV+2diKDf2MbILYtzUfZXtmYZVgojVI3mEq',
    sessionToken: 'FwoGZXIvYXdzELn//////////wEaDJoSxB01WDls37bmBSLAAdgMVLlbFznuxOea6NEHY+ZtiPIhdCCuwKmtvYUytX2yvVUq0Vv96aYrO/Y6K5N8j0lGOP+ArQK6U0G/f/bsWblMpt2ud/NwRnCX+aV2xo76jirwNq2xYceJlPAWJts2u+XNcW6bJmrBNZ/EZtR+ilLUHEd6iQjXIQFeOvjCbGFsCn38lgpVXIEf7TZ7XIpSu2VAH7hEgDMQtIy9j+79EdioUO9PERFMnZUOBXYwawSbgNkTwDHuMdWvPv8SYjt9OyiRz++fBjItIqUKG6UWU6V9gq8qlT9PiGrym3s3GOCahrh+wpmImcyTUPB/VAx5lJ+2wKQk'
});

const s3 = new AWS.S3();

const postStart = async () => {
    const resp = await axios.post('http://52.91.127.198:8080/start', {
        banner: "B00911903",
        ip: "54.89.28.0:5000"
    })
    console.log(resp.data);
    
}
postStart();

app.post('/storedata', (req, res) => {
    const getData = req.body.data;
    console.log(getData);

    s3.upload({
        Bucket: 'csci5409-00911903',
        Key: 'file.txt',
        Body: getData
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

app.post('/appenddata', (req, res) => {
    const bucketName = "csci5409-00911903";
    const keyName = "file.txt";

    const toAppend = req.body.data.toString();
    if (toAppend){
        s3.getObject({Bucket : bucketName, Key : keyName}, (err, data) => {
            if (err){
                console.log(err);
                res.status(500);
            } else {
                const oldContent = data.Body.toString();
                const afterAppend = oldContent + toAppend;
                s3.putObject({
                    Bucket:bucketName,
                    Key:keyName,
                    Body:afterAppend
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

app.listen(PORT, (error) => {
    if (!error){
        console.log("Server is running on PORT: "+PORT)
    }
    else{
        console.log("Error Occured")
    }
})