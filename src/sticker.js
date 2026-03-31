const sharp = require('sharp');
const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const fs = require('fs-extra');
const path = require('path');
const os = require('os');

ffmpeg.setFfmpegPath(ffmpegPath);

async function convertirSticker(buffer, esVideo = false) {
    if (esVideo) {
        return await videoAWebpAnimado(buffer);
    }
    return await imagenAWebp(buffer);
}

async function imagenAWebp(buffer) {
    return await sharp(buffer)
        .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .webp()
        .toBuffer();
}

async function videoAWebpAnimado(buffer) {
    const tmpDir = os.tmpdir();
    const inputPath = path.join(tmpDir, `input_${Date.now()}.mp4`);
    const outputPath = path.join(tmpDir, `output_${Date.now()}.webp`);

    await fs.writeFile(inputPath, buffer);

    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .outputOptions([
                '-vcodec', 'libwebp',
                '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=white@0.0',
                '-loop', '0',
                '-preset', 'default',
                '-an',
                '-vsync', '0',
                '-t', '00:00:05'
            ])
            .toFormat('webp')
            .on('end', async () => {
                const resultado = await fs.readFile(outputPath);
                await fs.remove(inputPath);
                await fs.remove(outputPath);
                resolve(resultado);
            })
            .on('error', (err) => {
                reject(err);
            })
            .save(outputPath);
    });
}

async function cmdSticker(sock, jid, msg) {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    if (!quoted) {
        await sock.sendMessage(jid, { text: '❌ Responde a una imagen o video para convertirlo en sticker.\nUsa: *!sticker* (respondiendo a una imagen)' });
        return;
    }

    let buffer;
    let esVideo = false;

    try {
        if (quoted.imageMessage) {
            const stream = await sock.downloadContentFromMessage(quoted.imageMessage, 'image');
            const chunks = [];
            for await (const chunk of stream) chunks.push(chunk);
            buffer = Buffer.concat(chunks);
        } else if (quoted.videoMessage) {
            esVideo = true;
            const stream = await sock.downloadContentFromMessage(quoted.videoMessage, 'video');
            const chunks = [];
            for await (const chunk of stream) chunks.push(chunk);
            buffer = Buffer.concat(chunks);
        } else if (quoted.stickerMessage) {
            await sock.sendMessage(jid, { text: '❌ Ya es un sticker.' });
            return;
        } else {
            await sock.sendMessage(jid, { text: '❌ Solo puedo convertir imágenes o videos.' });
            return;
        }

        await sock.sendMessage(jid, { text: '⏳ Convirtiendo a sticker...' });
        const stickerBuffer = await convertirSticker(buffer, esVideo);
        await sock.sendMessage(jid, { sticker: stickerBuffer });
    } catch (err) {
        await sock.sendMessage(jid, { text: `❌ Error al crear sticker: ${err.message}` });
    }
}

module.exports = { cmdSticker };
