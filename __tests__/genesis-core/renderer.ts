/* eslint-disable no-undef */
import path from 'path';
import { IncomingMessage, ServerResponse } from 'http';
import { Socket } from 'net';
import { SSR } from '../../packages/genesis-core/src/ssr';

const ssr = {
    home: new SSR({
        name: 'ssr-home',
        build: {
            baseDir: path.resolve(__dirname, '../../examples/ssr-home')
        }
    })
};

test('renderer.ssr ', async () => {
    const renderer = ssr.home.createRenderer();
    await expect(renderer.ssr).toBe(ssr.home);
});

test('renderer.staticDir', async () => {
    const renderer = ssr.home.createRenderer();
    await expect(renderer.staticDir).toBe(ssr.home.outputDirInClient);
});

test('renderer.staticPublicPath', async () => {
    const renderer = ssr.home.createRenderer();
    await expect(renderer.staticPublicPath).toBe(ssr.home.publicPath);
});

test('renderer.render', async () => {
    const renderer = ssr.home.createRenderer();

    // Base
    let result = await renderer.render();
    await expect(result.type).toBe('html');
    await expect(typeof result.data).toBe('string');
    await expect(result.context.data.name).toBe(ssr.home.name);
    await expect(result.context.data.url).toBe('/');
    await expect(result.context.mode).toBe('ssr-html');

    // options.(url | req | res)
    const req = new IncomingMessage(new Socket());
    const res = new ServerResponse(req);

    result = await renderer.render({ url: '/test' });
    await expect(result.context.data.url).toBe('/test');

    result = await renderer.render({ req, res });
    await expect(result.context.data.url).toBe('');
    await expect(result.context.req).toBe(req);
    await expect(result.context.res).toBe(res);

    req.url = '/test2';
    result = await renderer.render({ req, res });
    await expect(result.context.data.url).toBe('/test2');
    await expect(result.context.req).toBe(req);
    await expect(result.context.res).toBe(res);

    req.url = '/test2';
    result = await renderer.render({ req, res, url: '/test3' });
    await expect(result.context.data.url).toBe('/test3');
    await expect(result.context.req).toBe(req);
    await expect(result.context.res).toBe(res);

    // options.mode
    result = await renderer.render({ mode: 'ssr-html' });
    await expect(result.context.mode).toBe('ssr-html');
    await expect(result.data).not.toBe(result.context.data.html);
    await expect(result.data).toBe(result.context.compile(result.context.data));

    result = await renderer.render({ mode: 'csr-html' });
    await expect(result.context.mode).toBe('csr-html');
    await expect(result.context.data.html).toBe(
        '<div data-ssr-genesis-id="8d07b00bc6ec949da008e624ef609b3d"></div>'
    );
    await expect(result.data).not.toBe(result.context.data.html);
    await expect(result.data).toBe(result.context.compile(result.context.data));
});