import express, { Router, Request, Response } from 'express';
import AWS from 'aws-sdk';
import checkOrigin from '../util/checkOrigin';
import constants from '../constants/constants.json';
import { int } from 'aws-sdk/clients/datapipeline';

const credentials = new AWS.SharedIniFileCredentials();
AWS.config.credentials = credentials;
const s3 = new AWS.S3();
const bucket = constants['photos-bucket'];

// Encode data of s3 object into base64 for front end to display
const encodeBase64 = (data: AWS.S3.Body): string => {
    const buf = Buffer.from(data);
    const base64 = buf.toString('base64');
    return base64;
};

const getObjNameIndex = (name: string): int => {
    return parseInt(name.split('_')[0]);
};

const getObjectNameFromKey = (key: string): string => {
    return key.split('/')[1];
};

const getObjectIndex = (s3Obj: AWS.S3.Object): int => {
    return getObjNameIndex(getObjectNameFromKey(s3Obj.Key));
};

const getKeyPage = (s3Obj: AWS.S3.Object): int => {
    return parseInt(s3Obj.Key.split('/')[0].split('_')[1]);
};

const router: Router = express.Router();
router.get('/image', (req: Request, res: Response) => {
    const origin = req.get('origin');
    if (checkOrigin(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.contentType('json');
    const key = req.query.key.toString();
    s3.getObject({
        Bucket: bucket,
        Key: key,
    })
        .promise()
        .then((data) =>
            res.send({
                ContentType: data.ContentType,
                Body: encodeBase64(data.Body),
                Index: getObjNameIndex(getObjectNameFromKey(key)) - 1,
            }),
        )
        .catch((err) => {
            console.log(err);
            res.status(500);
            res.send('Could not get a photography photo');
        });
});

router.get('/image-list', (req: Request, res: Response) => {
    const origin = req.get('origin');
    if (checkOrigin(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.contentType('json');
    s3.listObjectsV2({
        Bucket: bucket,
    })
        .promise()
        .then((data) => {
            const result = data.Contents.filter(({ Key }) => {
                return Key.split('/')[1];
            }).sort((a, b) => {
                const firstKey = getObjectIndex(a);
                const secondKey = getObjectIndex(b);
                return getKeyPage(a) - getKeyPage(b) || firstKey - secondKey;
            });
            res.send(result);
        })
        .catch((err) => {
            console.log(err);
            res.status(500);
            res.send('Could not get list of images');
        });
});

export default router;
