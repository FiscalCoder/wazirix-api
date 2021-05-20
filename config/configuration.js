import dot from 'dotenv'

dot.config();

const config = {};

config.imagePath = process.env.IMAGE_PATH;

export default config;
