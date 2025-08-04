function update() {
  console.log('Updating pixel art...');
  const config = {
    freepalette: [
      [0,0,0],
      [60,60,60],
      [120,120,120],
      [210,210,210],
      [255,255,255],
      [96,0,24],
      [237,28,36],
      [255,127,39],
      [246,170,9],
      [249,221,59],
      [255,250,188],
      [14,185,104],
      [19,230,123],
      [135,255,94],
      [12,129,110],
      [16,174,166],
      [19,225,190],
      [96,247,242],
      [40,80,158],
      [64,147,228],
      [107,80,246],
      [153,177,251],
      [120,12,153],
      [170,56,185],
      [211,153,238],
      [203,0,122],
      [236,31,128],
      [243,141,169],
      [104,70,52],
      [149,104,42],
      [248,178,119],
    ],
    paidpalette: [
      [255,197,165],
      [109,100,63],
      [148,140,107],
      [205,197,158],
      [51,57,65],
      [109,117,141],
      [179,185,209],
      [219,164,99],
      [123,99,82],
      [156,132,107],
      [214,181,148],
      [209,128,81],
      [155,82,73],
      [209,128,120],
      [250,182,164],
      [74,66,132],
      [122,113,196],
      [181,174,241],
      [125,199,255],
      [77,49,184],
      [187,250,242],
      [15,121,159],
      [156,132,49],
      [197,173,49],
      [232,212,95],
      [74,107,58],
      [90,148,74],
      [132,197,115],
      [170,170,170],
      [165,14,30],
      [250,128,114],
      [228,92,26],
    ],
  };
  config.fullpalette = config.freepalette.concat(config.paidpalette);

  // Use the hidden image element as the source
  const img = document.getElementById('sourceImage');
  const canvas = document.getElementById('pixelitcanvas');

  if (!img || !canvas) {
    console.error('Source image or target canvas not found.');
    return;
  }

  if (!img.complete) {
    img.onload = () => update();
    return;
  }

  const px = new pixelit({
    from: img,
    to: canvas,
  });

  const usedPalette = document.getElementById('palette-select')?.value || 'all';
  if (usedPalette === 'free') {
    px.setPalette(config.freepalette);
  } else {
    px.setPalette(config.fullpalette);
  }

  const usepixelate = !!document.getElementById('pixelate')?.checked;
  const usepalette = !!document.getElementById('palette')?.checked;
  const usegreyscale = !!document.getElementById('greyscale')?.checked;
  const blocksize = parseInt(document.getElementById('blocksize')?.value, 10) || 4;
  const maxheight = parseInt(document.getElementById('maxheight')?.value, 10) || 0;
  const maxwidth = parseInt(document.getElementById('maxwidth')?.value, 10) || 0;
  console.log('Pixelate:', usepixelate, 'Palette:', usepalette);

  px.setScale(blocksize).draw();
  if (usepixelate) {
    px.pixelate();
  }
  if (usegreyscale) {
    px.convertGrayscale();
  }
  if (usepalette) {
    px.convertPalette();
  }
  console.log(blocksize);
  if (blocksize) {
    px.setScale(blocksize);
  }
  if (maxheight) {
    px.setMaxHeight(maxheight).resizeImage();
  }
  if (maxwidth) {
    px.setMaxWidth(maxwidth).resizeImage();
  }
  console.log('Pixel art updated successfully.');

  return px;
}

function drawCanva(file) {
  const canvas = document.getElementById('pixelitcanvas');
  const img = document.getElementById('sourceImage');
  if (file && img) {
    const reader = new FileReader();
    reader.onload = function (evt) {
      img.onload = function () {
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        update();
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Create a hidden image element for processing
  let img = document.getElementById('sourceImage');
  if (!img) {
    img = document.createElement('img');
    img.id = 'sourceImage';
    img.style.display = 'none';
    document.body.appendChild(img);
  }

  // Handle file input change
  const fileInput = document.getElementById('pixlInput');
  const canvas = document.getElementById('pixelitcanvas');
  if (fileInput && canvas) {
    fileInput.addEventListener('change', function (e) {
      const file = e.target.files[0];
      drawCanva(file);
    });
  }

  // Handle paste event for images
  document.addEventListener('paste', function (e) {
    if (e.clipboardData && e.clipboardData.items) {
      for (let i = 0; i < e.clipboardData.items.length; i++) {
        const item = e.clipboardData.items[i];
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            drawCanva(file);
            e.preventDefault();
            break;
          }
        }
      }
    }
  });

  // Handle drag and drop for images
  document.addEventListener('dragover', function (e) {
    e.preventDefault();
  });
  document.addEventListener('drop', function (e) {
    e.preventDefault();
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        drawCanva(file);
      }
    }
  });

  // Handle settings input changes
  document.querySelectorAll('.inputbtn').forEach(input => {
    input.addEventListener('input', update);
  });


  // Handle blocksize input display
  const blocksizeInput = document.getElementById('blocksize');
  const blockvalueOutput = document.getElementById('blockvalue');
  if (blocksizeInput && blockvalueOutput) {
    blocksizeInput.addEventListener('input', () => {
      blockvalueOutput.textContent = blocksizeInput.value;
    });
    // Initialize on load
    blockvalueOutput.textContent = blocksizeInput.value;
  }

  // Handle download button
  const downloadButton = document.getElementById('downloadimage');
  downloadButton.addEventListener('click', () => {
    px = update();
    if (px) {
      px.saveImage();
    }
  });

});
