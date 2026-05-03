const cloudinary = require('../config/cloudinary');
const fs = require('fs');

const uploadImage = async (fileBuffer) => {
    try {
        if(!fileBuffer) return null;
        const response = await cloudinary.uploader.upload(fileBuffer, {
            resource_type: 'image',
        });
        console.log("File uploaded successfully", response.url);
        return response;
    } catch (error) {
        fs.unlinkSync(fileBuffer);
        return null;
    }




    // return new Promise((resolve, reject) => {
    //     const stream = cloudinary.uploader.upload_stream(
    //         { folder },
    //         (error, result) => {
    //             if (error) {
    //                 reject(error);
    //             } else {
    //                 resolve({
    //                     url: result.secure_url,
    //                     publicId: result.public_id
    //                 });
    //             }
    //         }
    //     );
    //     const { Readable } = require('stream');
    //     const readableStream = Readable.from(fileBuffer);
    //     readableStream.pipe(stream);
    // });
};

const deleteImage = async (publicId) => {
    try {
        if(!publicId) return null;
        const response = await cloudinary.uploader.destroy(publicId);
        console.log("File deleted successfully", response);
        return response;
    } catch (error) {
        console.log("Error deleting file", error);
        return null;
    }





    // return new Promise((resolve, reject) => {
    //     cloudinary.uploader.destroy(publicId, (error, result) => {
    //         if (error) {
    //             reject(error);
    //         } else {
    //             resolve(result);
    //         }
    //     });
    // });
};

module.exports = { uploadImage, deleteImage };
