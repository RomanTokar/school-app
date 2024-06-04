import { UnsupportedMediaTypeException } from '@nestjs/common';

const imageFileFilter = (
  req,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (['image'].some((m) => file.mimetype.includes(m))) {
    callback(null, true);
  } else {
    callback(
      new UnsupportedMediaTypeException(
        `File type is not matching: ${['image'].join(', ')}`,
      ),
      false,
    );
  }
};

export default imageFileFilter;
