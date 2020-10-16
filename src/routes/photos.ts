import express, { Router, Request, Response } from 'express';
import AWS from 'aws-sdk';

const credentials = new AWS.SharedIniFileCredentials();
AWS.config.credentials = credentials;
const s3 = new AWS.S3();
const bucket = 'aquaticbasket-media';

// Encode data of s3 object into base64 for front end to display
const encodeBase64 = (data: AWS.S3.Body): string => {
    const buf = Buffer.from(data);
    const base64 = buf.toString('base64');
    return base64;
};

const router: Router = express.Router();
router.get('/photography', (req: Request, res: Response) => {
    res.contentType('json');
    res.header('Access-Control-Allow-Origin', '*');
    s3.listObjectsV2({
        Bucket: bucket,
    })
        .promise()
        .then((data) => {
            const bucketObjKeys = data.Contents.filter(({ Key }) => {
                const fileParts = Key.split('/');
                return fileParts[0] === 'photos' && fileParts.length === 2 && fileParts[1];
            });
            return Promise.all(
                bucketObjKeys.map(({ Key }) =>
                    s3
                        .getObject({
                            Bucket: bucket,
                            Key,
                        })
                        .promise()
                        .then((data) => ({
                            ContentType: data.ContentType,
                            Body: encodeBase64(data.Body),
                        }))
                        .catch((err) => {
                            console.log(err);
                            res.status(500);
                            res.send('Could not get a photography photo');
                        }),
                ),
            );
        })
        .then((encodedImages) => {
            res.send(encodedImages);
        })
        .catch((err) => {
            console.log(err);
            res.status(500);
            res.send('Could not get photography photos');
        });
});

export default router;
