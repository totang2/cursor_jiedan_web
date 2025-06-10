const AlipaySdk = require('alipay-sdk');
const AlipayFormData = require('alipay-sdk/lib/form').default;

interface AlipayConfig {
    appId: string;
    privateKey: string;
    encryptKey: string;
    alipayPublicKey: string;
    gateway: string;
}

// Format the private key by adding newlines
function formatPrivateKey(key: string): string {
    if (!key) return '';
    return `-----BEGIN RSA PRIVATE KEY-----\n${key}\n-----END RSA PRIVATE KEY-----`;
}

// Format the public key by adding newlines
function formatPublicKey(key: string): string {
    if (!key) return '';
    return `-----BEGIN PUBLIC KEY-----\n${key}\n-----END PUBLIC KEY-----`;
}

const config: AlipayConfig = {
    appId: process.env.ALIPAY_APP_ID || '',
    privateKey: formatPrivateKey(process.env.ALIPAY_PRIVATE_KEY || ''),
    encryptKey: process.env.ALIPAY_ENCRYPT_KEY || '',
    alipayPublicKey: formatPublicKey(process.env.ALIPAY_PUBLIC_KEY || ''),
    gateway: process.env.NODE_ENV === 'production'
        ? 'https://openapi.alipay.com/gateway.do'
        : 'https://openapi-sandbox.dl.alipaydev.com/gateway.do',
};

// Validate required configuration
if (!config.appId || !config.privateKey || !config.alipayPublicKey) {
    console.error('Missing required Alipay configuration. Please check your environment variables.');
}

const alipay = new AlipaySdk(config);

export { alipay, AlipayFormData };