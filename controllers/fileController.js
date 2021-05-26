const fs = require ('fs');
const path = require ('path');
const archiver = require ('archiver');
const zips = require('../services/zips');
const spleeter = require('../services/spleeter')

exports.createZip = () => {
    //archivo de prueba para ver como funciona el zip
    //falta parametrizar el output
    const output = fs.createWriteStream(process.cwd() + '/data/example.zip');
    const archive = archiver('zip', {zlib: { level: 9 }});

    // listen for all archive data to be written
    // 'close' event is fired only when a file descriptor is involved
    output.on('close', () => {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
    });

    output.on('end', () => {
        console.log('Data has been drained');
    });

    // good practice to catch warnings (ie stat failures and other non-blocking errors)
    archive.on('warning', (err) => {
    if (err.code === 'ENOENT') {
      // log warning
    } else {
      // throw error
      throw err;
    }
    });

    // good practice to catch this error explicitly
    archive.on('error', (err) => {
        throw err;
    });

    // pipe archive data to the file
    archive.pipe(output);

    // append files from a sub-directory and naming it `new-subdir` within the archive
    //falta parametrizar el nombre de Audios 
    archive.directory(process.cwd()+ '/audios', 'Audios');

    // finalize the archive (ie we are done appending files but streams have to finish yet)
    // 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
    archive.finalize();

    //falta meter el nombre y path en bbdd
}

exports.sendZip = (req, res, next) => {
    /*
    Crea el zip y lo va stremeando a la respuesta
    */
    const zip = archiver('zip');
    //streaming data
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="example.zip"');
    zip.pipe(res);
    zip.directory(process.cwd() + '/mp3_sample' , 'Audios').finalize();
}

exports.fullFunction = (req, res, next) => {
    /*
    const audioTrack = req.file;
    const hilos = req.body.stems;
    const bitrate = req.body.bitrate;
    const codec = req.body.codec;
    */
    let archivo = 'Prueba';
    let path = process.cwd() + '/mp3_sample';
    file = 'audio_example.mp3'
    hilos = '2 hilos';
    let stems = spleeter.hilos(hilos);
    spleeter.spawnSpleeter(1,1,stems,file)
    .then((code)=>{
        console.log(code);
        zips.sendZip(file,res,path);
    })
    .catch((err)=>{
        console.log(err);
    })
}