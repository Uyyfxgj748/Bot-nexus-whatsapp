const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const { execFile } = require('child_process');
const { promisify } = require('util');

const execFileAsync = promisify(execFile);
const YTDLP = 'yt-dlp';

const axiosOpts = {
    timeout: 20000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36'
    }
};

async function descargarBuffer(url) {
    const res = await axios.get(url, { ...axiosOpts, responseType: 'arraybuffer', timeout: 40000 });
    return Buffer.from(res.data);
}

function esUrlYoutube(texto) {
    return /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/.test(texto);
}

async function ytdlpEjecutar(args, timeout = 60000) {
    return execFileAsync(YTDLP, args, { timeout, maxBuffer: 10 * 1024 * 1024 });
}

async function ytdlpBuscarUrl(query) {
    const { stdout } = await ytdlpEjecutar([
        `ytsearch1:${query}`,
        '--print', '%(webpage_url)s\t%(title)s\t%(duration)s',
        '--no-playlist',
        '--quiet',
        '--no-warnings'
    ], 30000);
    const linea = stdout.trim().split('\n')[0];
    if (!linea) throw new Error('No se encontraron resultados.');
    const [url, titulo, duracion] = linea.split('\t');
    return { url, titulo: titulo || 'Sin título', duracion: parseInt(duracion) || 0 };
}

async function cmdYoutube(sock, jid, args) {
    const url = args[0];
    if (!url || !esUrlYoutube(url)) {
        await sock.sendMessage(jid, { text: '❌ Ingresa un link válido de YouTube.\nUso: *#yt <link>*' });
        return;
    }
    await sock.sendMessage(jid, { text: '⏳ Descargando video de YouTube...' });
    const tmpPath = path.join(os.tmpdir(), `yt_${Date.now()}.mp4`);
    try {
        const { stdout: infoRaw } = await ytdlpEjecutar([
            url, '--print', '%(title)s\t%(duration)s', '--no-playlist', '--quiet', '--no-warnings'
        ], 20000);
        const [titulo, durStr] = infoRaw.trim().split('\t');
        const dur = parseInt(durStr) || 0;
        if (dur > 300) {
            await sock.sendMessage(jid, { text: '❌ El video es muy largo. Máximo 5 minutos.' });
            return;
        }
        await ytdlpEjecutar([
            url,
            '-f', 'best[ext=mp4][filesize<50M]/best[filesize<50M]/best',
            '-o', tmpPath,
            '--no-playlist',
            '--quiet',
            '--no-warnings'
        ], 90000);
        const buffer = await fs.readFile(tmpPath);
        await sock.sendMessage(jid, { video: buffer, caption: `🎬 *${titulo || 'Video de YouTube'}*` });
        await fs.remove(tmpPath).catch(() => {});
    } catch (err) {
        await fs.remove(tmpPath).catch(() => {});
        await sock.sendMessage(jid, { text: `❌ Error al descargar video: ${err.message}` });
    }
}

async function cmdYoutubeAudio(sock, jid, args) {
    let consulta = args.join(' ');
    if (!consulta) {
        await sock.sendMessage(jid, { text: '❌ Uso: *#play <link o nombre de canción>*\nEjemplo: #play Bad Bunny Titi me pregunto' });
        return;
    }

    let urlFinal = consulta;
    let tituloFinal = '';

    if (!esUrlYoutube(consulta)) {
        await sock.sendMessage(jid, { text: `🔍 Buscando: *${consulta}*...` });
        try {
            const resultado = await ytdlpBuscarUrl(consulta);
            urlFinal = resultado.url;
            tituloFinal = resultado.titulo;
        } catch (err) {
            await sock.sendMessage(jid, { text: `❌ No encontré resultados para: *${consulta}*` });
            return;
        }
    }

    await sock.sendMessage(jid, { text: `⏳ Descargando audio${tituloFinal ? `: *${tituloFinal}*` : ''}...` });
    const tmpBase = path.join(os.tmpdir(), `yta_${Date.now()}`);
    const tmpMp3 = `${tmpBase}.mp3`;
    try {
        await ytdlpEjecutar([
            urlFinal,
            '-x',
            '--audio-format', 'mp3',
            '--audio-quality', '5',
            '-o', `${tmpBase}.%(ext)s`,
            '--no-playlist',
            '--quiet',
            '--no-warnings'
        ], 120000);
        const buffer = await fs.readFile(tmpMp3);
        await sock.sendMessage(jid, {
            audio: buffer,
            mimetype: 'audio/mpeg',
            ptt: false,
            fileName: `${tituloFinal || 'audio'}.mp3`
        });
        await fs.remove(tmpMp3).catch(() => {});
    } catch (err) {
        await fs.remove(tmpMp3).catch(() => {});
        await sock.sendMessage(jid, { text: `❌ Error al descargar audio: ${err.message}` });
    }
}

async function cmdYoutubeSearch(sock, jid, args) {
    const query = args.join(' ');
    if (!query) {
        await sock.sendMessage(jid, { text: '❌ Uso: *#search <búsqueda>*\nEjemplo: #search Bad Bunny' });
        return;
    }
    await sock.sendMessage(jid, { text: `🔍 Buscando: *${query}*...` });
    try {
        const { stdout } = await ytdlpEjecutar([
            `ytsearch5:${query}`,
            '--print', '%(webpage_url)s\t%(title)s\t%(duration_string)s',
            '--no-playlist',
            '--quiet',
            '--no-warnings'
        ], 30000);
        const lineas = stdout.trim().split('\n').filter(Boolean);
        if (!lineas.length) {
            await sock.sendMessage(jid, { text: '❌ No se encontraron resultados.' });
            return;
        }
        let texto = `🎬 *Resultados para:* _${query}_\n\n`;
        lineas.forEach((linea, i) => {
            const partes = linea.split('\t');
            const url = partes[0];
            const titulo = partes[1] || 'Sin título';
            const dur = partes[2] || '';
            texto += `*${i + 1}.* ${titulo} _(${dur})_\n🔗 ${url}\n\n`;
        });
        texto += '👉 Usa *#play <link>* o *#yt <link>* para descargar';
        await sock.sendMessage(jid, { text: texto });
    } catch (err) {
        await sock.sendMessage(jid, { text: `❌ Error en la búsqueda: ${err.message}` });
    }
}

async function resolverURLTikTok(url) {
    if (url.includes('/video/') && url.includes('tiktok.com/@')) return url;
    return new Promise((resolve) => {
        const https = require('https');
        try {
            const urlObj = new URL(url);
            const req = https.request({
                hostname: urlObj.hostname,
                path: urlObj.pathname + urlObj.search,
                method: 'GET',
                headers: { 'User-Agent': 'WhatsApp/2.23.20.0 A', 'Accept': '*/*' }
            }, (res) => {
                const location = res.headers['location'] || '';
                const idMatch = location.match(/\/video\/(\d+)/);
                if (idMatch) {
                    resolve(`https://www.tiktok.com/@user/video/${idMatch[1]}`);
                } else {
                    resolve(url);
                }
            });
            req.on('error', () => resolve(url));
            req.setTimeout(8000, () => { req.destroy(); resolve(url); });
            req.end();
        } catch { resolve(url); }
    });
}

async function tiktokDescargar(url) {
    const urlResuelta = await resolverURLTikTok(url);
    const errores = [];
    const headers = { ...axiosOpts.headers, 'Content-Type': 'application/x-www-form-urlencoded' };

    try {
        const params = new URLSearchParams({ url: urlResuelta, hd: '0' });
        const res = await axios.post('https://www.tikwm.com/api/', params.toString(), { headers, timeout: 20000 });
        if (res.data?.code === 0 && res.data?.data?.play) {
            return { videoUrl: res.data.data.play, titulo: res.data.data.title || 'TikTok' };
        }
        errores.push(`tikwm: código ${res.data?.code} - ${res.data?.msg}`);
    } catch (e) { errores.push(`tikwm: ${e.message}`); }

    try {
        const res = await axios.get(`https://api.tiklydown.eu.org/api/download/v2?url=${encodeURIComponent(urlResuelta)}`, { ...axiosOpts, timeout: 15000 });
        if (res.data?.video?.noWatermark) {
            return { videoUrl: res.data.video.noWatermark, titulo: res.data.title || 'TikTok' };
        }
        errores.push('tiklydown v2: respuesta inesperada');
    } catch (e) { errores.push(`tiklydown v2: ${e.message}`); }

    try {
        const res = await axios.get(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(urlResuelta)}`, { ...axiosOpts, timeout: 15000 });
        if (res.data?.video?.noWatermark) {
            return { videoUrl: res.data.video.noWatermark, titulo: res.data.title || 'TikTok' };
        }
        errores.push('tiklydown v1: respuesta inesperada');
    } catch (e) { errores.push(`tiklydown v1: ${e.message}`); }

    throw new Error('No se pudo descargar el video. Asegúrate de que el link sea público y válido.');
}

async function cmdTiktok(sock, jid, args) {
    const url = args[0];
    if (!url || !url.includes('tiktok')) {
        await sock.sendMessage(jid, { text: '❌ Ingresa un link válido de TikTok.\nUso: *#tiktok <link>*' });
        return;
    }
    await sock.sendMessage(jid, { text: '⏳ Descargando video de TikTok...' });
    try {
        const { videoUrl, titulo } = await tiktokDescargar(url);
        const buffer = await descargarBuffer(videoUrl);
        await sock.sendMessage(jid, { video: buffer, caption: `🎵 *${titulo}*` });
    } catch (err) {
        await sock.sendMessage(jid, { text: `❌ Error al descargar TikTok: ${err.message}` });
    }
}

async function twitterDescargar(url) {
    const tweetId = url.match(/status\/(\d+)/)?.[1];
    if (!tweetId) throw new Error('URL inválida. Asegúrate de que el link contenga el ID del tweet.');
    const errores = [];

    try {
        const res = await axios.get(`https://api.vxtwitter.com/Twitter/status/${tweetId}`, { ...axiosOpts, timeout: 15000 });
        const media = res.data?.media_extended?.find(m => m.type === 'video');
        if (media?.url) return media.url;
        errores.push('vxtwitter: sin video');
    } catch (e) { errores.push(`vxtwitter: ${e.message}`); }

    try {
        const res = await axios.get(`https://twitsave.com/info?url=${encodeURIComponent(url)}`, { ...axiosOpts, timeout: 15000 });
        const match = res.data.match(/https?:\/\/video\.twimg\.com\/[^"'\s]+\.mp4[^"'\s]*/);
        if (match) return match[0];
        errores.push('twitsave: sin video');
    } catch (e) { errores.push(`twitsave: ${e.message}`); }

    throw new Error('No se pudo descargar el video de Twitter/X.');
}

async function cmdTwitter(sock, jid, args) {
    const url = args[0];
    if (!url || (!url.includes('twitter.com') && !url.includes('x.com'))) {
        await sock.sendMessage(jid, { text: '❌ Ingresa un link válido de Twitter/X.\nUso: *#twitter <link>*' });
        return;
    }
    await sock.sendMessage(jid, { text: '⏳ Descargando video de Twitter/X...' });
    try {
        const videoUrl = await twitterDescargar(url);
        const buffer = await descargarBuffer(videoUrl);
        await sock.sendMessage(jid, { video: buffer, caption: '🐦 Video de Twitter/X' });
    } catch (err) {
        await sock.sendMessage(jid, { text: `❌ Error al descargar Twitter/X: ${err.message}` });
    }
}

async function instagramDescargar(url) {
    const errores = [];
    try {
        const res = await axios.get(`https://api.snapinsta.app/v1/media?url=${encodeURIComponent(url)}`, {
            ...axiosOpts, timeout: 15000
        });
        if (res.data?.data?.[0]?.url) return res.data.data[0].url;
        errores.push('snapinsta: sin resultado');
    } catch (e) { errores.push(`snapinsta: ${e.message}`); }

    try {
        const res = await axios.post('https://www.saveig.app/api/convert', { url }, {
            headers: { ...axiosOpts.headers, 'Content-Type': 'application/json' },
            timeout: 15000
        });
        if (res.data?.data?.[0]?.url) return res.data.data[0].url;
        errores.push('saveig: sin resultado');
    } catch (e) { errores.push(`saveig: ${e.message}`); }

    try {
        const reelId = url.match(/\/(?:reel|p)\/([A-Za-z0-9_-]+)/)?.[1];
        if (reelId) {
            const res = await axios.get(`https://www.instagram.com/p/${reelId}/?__a=1&__d=dis`, {
                headers: { ...axiosOpts.headers, 'Cookie': 'sessionid=0' }, timeout: 15000
            });
            const videoUrl = res.data?.items?.[0]?.video_versions?.[0]?.url;
            if (videoUrl) return videoUrl;
        }
        errores.push('instagram api: sin video');
    } catch (e) { errores.push(`instagram api: ${e.message}`); }

    throw new Error('No se pudo descargar el reel. Asegúrate de que el link sea público.');
}

async function cmdInstagram(sock, jid, args) {
    const url = args[0];
    if (!url || (!url.includes('instagram.com') && !url.includes('instagr.am'))) {
        await sock.sendMessage(jid, { text: '❌ Ingresa un link válido de Instagram.\nUso: *#ig <link>*' });
        return;
    }
    await sock.sendMessage(jid, { text: '⏳ Descargando reel de Instagram...' });
    try {
        const mediaUrl = await instagramDescargar(url);
        const buffer = await descargarBuffer(mediaUrl);
        const esVideo = mediaUrl.includes('.mp4') || !mediaUrl.includes('.jpg');
        if (esVideo) {
            await sock.sendMessage(jid, { video: buffer, caption: '📸 Reel de Instagram' });
        } else {
            await sock.sendMessage(jid, { image: buffer, caption: '📸 Imagen de Instagram' });
        }
    } catch (err) {
        await sock.sendMessage(jid, { text: `❌ Error al descargar Instagram: ${err.message}` });
    }
}

async function cmdPinterest(sock, jid, args) {
    const query = args.join(' ');
    if (!query) {
        await sock.sendMessage(jid, { text: '❌ Uso: *#pinterest <búsqueda>*\nEjemplo: #pinterest anime wallpaper' });
        return;
    }
    await sock.sendMessage(jid, { text: `🔍 Buscando en Pinterest: *${query}*...` });
    try {
        const res = await axios.get(`https://api.pinterest.com/v3/search/boards/?q=${encodeURIComponent(query)}&page_size=5`, {
            ...axiosOpts, timeout: 15000
        });
        if (res.data?.data?.[0]?.image_cover_url) {
            const imgUrl = res.data.data[0].image_cover_url;
            const buffer = await descargarBuffer(imgUrl);
            await sock.sendMessage(jid, { image: buffer, caption: `📌 Pinterest: *${query}*` });
            return;
        }
        const res2 = await axios.get(`https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}&rs=typed`, {
            headers: { ...axiosOpts.headers, 'Accept': 'application/json' }, timeout: 15000
        });
        const match = res2.data.match(/"url":"(https:\/\/i\.pinimg\.com[^"]+\.jpg)"/);
        if (match) {
            const buffer = await descargarBuffer(match[1]);
            await sock.sendMessage(jid, { image: buffer, caption: `📌 Pinterest: *${query}*` });
        } else {
            await sock.sendMessage(jid, { text: '❌ No se encontraron imágenes en Pinterest.' });
        }
    } catch (err) {
        await sock.sendMessage(jid, { text: `❌ Error al buscar en Pinterest: ${err.message}` });
    }
}

async function cmdImagen(sock, jid, args) {
    const url = args[0];
    if (!url) {
        await sock.sendMessage(jid, { text: '❌ Ingresa un link de imagen.\nUso: *#img <link>*' });
        return;
    }
    try {
        const buffer = await descargarBuffer(url);
        await sock.sendMessage(jid, { image: buffer, caption: '🖼️ Imagen descargada' });
    } catch (err) {
        await sock.sendMessage(jid, { text: `❌ No pude descargar la imagen: ${err.message}` });
    }
}

module.exports = { cmdYoutube, cmdYoutubeAudio, cmdYoutubeSearch, cmdTiktok, cmdTwitter, cmdInstagram, cmdPinterest, cmdImagen };
