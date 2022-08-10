FROM python:3.9


ARG user=app
ARG group=app
ARG uid=1000
ARG gid=1000

ENV PIP_EXTRA_INDEX_URL=https://www.piwheels.org/simple

RUN apt-get update 
RUN apt-get install libsm6 libxext6  -y &&\
    apt-get install libgraphite2-3 libatspi2.0-0 libthai0 libxcb-shm0 libxcb-render0 libswscale5 librsvg2-2 libvorbisenc2 libavutil56 libzvbi0 libgsm1 libxinerama1 libxvidcore4 libsrt1.4-gnutls libswresample3 libatk1.0-0 libvorbisfile3 libogg0 libpangoft2-1.0-0 libpgm-5.3-0 libwayland-egl1 libharfbuzz0b libpango-1.0-0 libcairo2 libva-x11-2 libwayland-cursor0 libgfortran5 libxfixes3 libgme0 libxrender1 libvorbis0a libxi6 libudfread0 libspeex1 libwebpmux3 libsodium23 libdatrie1 libatk-bridge2.0-0 libxrandr2 libbluray2 libx264-160 libwavpack1 libxcomposite1 libpangocairo-1.0-0 libsoxr0 libshine3 libxkbcommon0 libvdpau1 libgtk-3-0 libopus0 librabbitmq4 libgdk-pixbuf-2.0-0 libavformat58 libmpg123-0 libxdamage1 libzmq5 libdav1d4 libopenmpt0 libatlas3-base libva2 libva-drm2 libxcursor1 libssh-gcrypt-4 libavcodec58 libaom0 libx265-192 libwayland-client0 libcairo-gobject2 libcodec2-0.9 libpixman-1-0 libdrm2 libsnappy1v5 libnorm1 libopenjp2-7 libtheora0 ocl-icd-libopencl1 libtwolame0 libvpx6 libepoxy0 libchromaprint1 libmp3lame0 libgfortran5 libatlas3-base -y &&\
    pip install --upgrade pip

COPY requirements.txt __init__.py run.py ./

RUN cat requirements.txt | xargs -n 1 pip install  &&\
    wget https://olivewheels.blob.core.windows.net/repo/onnxruntime_olive-0.4.0-py3-none-any.whl &&\
    wget https://raw.githubusercontent.com/nknytk/built-onnxruntime-for-raspberrypi-linux/master/wheels/buster/onnxruntime-1.7.2-cp39-cp39-linux_armv7l.whl &&\
    pip install onnxruntime_olive-0.4.0-py3-none-any.whl || echo "Failed to install onnxruntime for x86"

COPY src/ src

CMD [ "python",  "run.py" ]