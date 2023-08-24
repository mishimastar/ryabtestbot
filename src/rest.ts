import { createServer, IncomingMessage } from 'node:http';
import { LastData } from './main';

const mime = {
    html: 'text/html',
    txt: 'text/plain',
    css: 'text/css',
    gif: 'image/gif',
    jpg: 'image/jpeg',
    png: 'image/png',
    svg: 'image/svg+xml',
    js: 'application/javascript',
    json: 'application/json'
};

const processGet = (req: IncomingMessage): [data: string, status: number, content: string] => {
    const url = new URL(req.url!, `http://${req.headers.host}`);
    switch (url.pathname) {
        case '/rs':
            return [LastData.get().RSrub2baht.toFixed(3), 200, mime.txt];

        default:
            return ['not found', 404, mime.txt];
    }
};
// eslint-disable-next-line @typescript-eslint/no-misused-promises
const server = createServer((req, res) => {
    // console.log('Request:', new URL(req.url!, `http://${req.headers.host}`));
    if (req.method !== 'GET') {
        console.error(`wrong method ${req.method}`);
        res.statusCode = 400;
        res.end();
        return;
    }
    try {
        const [data, status, content] = processGet(req);
        res.writeHead(status, { 'Content-Type': content });
        res.end(data);
    } catch (error) {
        console.error('Error: ', error);
        res.statusCode = 500;
        res.end();
    }
    // console.log(response);
});

export const StartAPI = async () => {
    await new Promise<void>((res) => server.listen(8080, res));
    console.log('rest api started on 8080');
};
export async function StopAPI() {
    await new Promise<void>((res, rej) => server.close((e) => (e ? rej(e) : res())));
    console.log('rest api finished');
}
