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

async function cmdStickerSearch(sock, jid, args) {
    const query = args.join(' ');
    if (!query) {
        await sock.sendMessage(jid, { text: '❌ Uso: *#stickersearch <búsqueda>*\nEjemplo: #stickersearch Miku' });
        return;
    }
    await sock.sendMessage(jid, { text: `🔍 Buscando sticker: *${query}*...` });
    try {
        const giphyKey = 'dc6zaTOxFJmzC';
        const res = await axios.get(
            `https://api.giphy.com/v1/stickers/search?api_key=${giphyKey}&q=${encodeURIComponent(query)}&limit=5&rating=pg-13`,
            { timeout: 10000 }
        );
        const resultados = res.data?.data;
        if (!resultados || resultados.length === 0) {
            await sock.sendMessage(jid, { text: `❌ No encontré stickers para: *${query}*` });
            return;
        }
        const elegido = resultados[Math.floor(Math.random() * resultados.length)];
        const gifUrl = elegido.images?.original?.url || elegido.images?.fixed_height?.url;
        if (!gifUrl) {
            await sock.sendMessage(jid, { text: '❌ No pude obtener el sticker. Intenta otra búsqueda.' });
            return;
        }
        const gifRes = await axios.get(gifUrl, { responseType: 'arraybuffer', timeout: 20000 });
        const buffer = Buffer.from(gifRes.data);
        const stickerBuffer = await videoAWebpAnimado(buffer);
        await sock.sendMessage(jid, { sticker: stickerBuffer });
    } catch (err) {
        try {
            const tenorRes = await axios.get(
                `https://g.tenor.com/v1/search?q=${encodeURIComponent(query)}&key=LIVDSRZULELA&limit=5&media_filter=minimal`,
                { timeout: 10000 }
            );
            const tenorResultados = tenorRes.data?.results;
            if (!tenorResultados || tenorResultados.length === 0) {
                await sock.sendMessage(jid, { text: `❌ No encontré stickers para: *${query}*` });
                return;
            }
            const elegido = tenorResultados[Math.floor(Math.random() * tenorResultados.length)];
            const gifUrl = elegido.media?.[0]?.gif?.url;
            if (!gifUrl) {
                await sock.sendMessage(jid, { text: '❌ No pude obtener el sticker. Intenta otra búsqueda.' });
                return;
            }
            const gifRes = await axios.get(gifUrl, { responseType: 'arraybuffer', timeout: 20000 });
            const buffer = Buffer.from(gifRes.data);
            const stickerBuffer = await videoAWebpAnimado(buffer);
            await sock.sendMessage(jid, { sticker: stickerBuffer });
        } catch (err2) {
            await sock.sendMessage(jid, { text: `❌ Error al buscar sticker: ${err2.message}` });
        }
    }
}

module.exports = { cmdSticker, cmdStickerSearch };
