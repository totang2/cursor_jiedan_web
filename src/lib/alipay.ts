const AlipaySdk = require('alipay-sdk');

interface AlipayConfig {
    appId: string;
    privateKey: string;
    encryptKey: string;
    alipayPublicKey: string;
    gateway: string;
}

const config: AlipayConfig = {
    appId: process.env.ALIPAY_APP_ID || '',
    privateKey: process.env.ALIPAY_PRIVATE_KEY || '',
    encryptKey: process.env.ALIPAY_ENCRYPT_KEY || '',
    alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY || '',
    gateway: process.env.NODE_ENV === 'production'
        ? 'https://openapi.alipay.com/gateway.do'
        : 'https://openapi-sandbox.dl.alipaydev.com/gateway.do',
};

const alipay = new AlipaySdk(config);

// 导出 AlipayFormData 类型
export type AlipayFormData = {
    method: string;
    bizContent: Record<string, any>;
};

export { alipay }; 