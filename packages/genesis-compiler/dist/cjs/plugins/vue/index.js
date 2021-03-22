"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VuePlugin = void 0;
const path_1 = __importDefault(require("path"));
const webpack_1 = __importDefault(require("webpack"));
const plugin_1 = __importDefault(require("vue-loader/lib/plugin"));
const genesis_core_1 = require("@fmfe/genesis-core");
const vue_server_plugin_1 = require("./vue-server-plugin");
const vue_client_plugin_1 = require("./vue-client-plugin");
class VuePlugin extends genesis_core_1.Plugin {
    chainWebpack({ target, config }) {
        const { ssr } = this;
        switch (target) {
            case 'client':
                config.plugin('vue-ssr-client').use(vue_client_plugin_1.VueClientPlugin, [
                    {
                        filename: path_1.default.relative(ssr.outputDirInClient, ssr.outputClientManifestFile)
                    }
                ]);
                break;
            case 'server':
                config.plugin('vue-ssr-server').use(new vue_server_plugin_1.VueServerPlugin({
                    filename: path_1.default.relative(ssr.outputDirInServer, ssr.outputServerBundleFile)
                }));
                break;
        }
        config.resolve.extensions.add('.vue');
        config.module
            .rule('vue')
            .test(/\.vue$/)
            .include.add(this.ssr.srcIncludes)
            .end()
            .use('vue')
            .loader('vue-loader')
            .options(target === 'client'
            ? {}
            : {
                optimizeSSR: true
            });
        config.plugin('vue').use(plugin_1.default);
        config.plugin('define').use(webpack_1.default.DefinePlugin, [
            {
                'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
                'process.env.VUE_ENV': JSON.stringify(target),
                'process.env.GENESIS_NAME': JSON.stringify(ssr.name)
            }
        ]);
    }
}
exports.VuePlugin = VuePlugin;