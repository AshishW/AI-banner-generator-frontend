import React, { useState, useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import { FaFont, FaImage, FaShapes, FaTrash, FaLayerGroup, FaChevronLeft, FaChevronRight, FaDownload, FaSave } from 'react-icons/fa';
import './NewBannerEditor.css';

const BannerEditor = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [layers, setLayers] = useState([]);
  const [showRightSidebar, setShowRightSidebar] = useState(true);

  useEffect(() => {
    const canvasJSON = localStorage.getItem('canvasData');
    const canvasResolution = localStorage.getItem('canvasResolution');

    let width = 800;
    let height = 600;

    if (canvasResolution) {
      [width, height] = canvasResolution.split('x').map(Number);
    }

    const newCanvas = new fabric.Canvas(canvasRef.current, {
      width: width,
      height: height,
    });

    if (canvasJSON) {
      newCanvas.loadFromJSON(canvasJSON, () => {
        newCanvas.renderAll();
        updateLayers(newCanvas);
      });
    }

    setCanvas(newCanvas);

    const handleResize = () => {
      resizeCanvas(newCanvas);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      newCanvas.dispose();
    };
  }, []);

  const resizeCanvas = (canvas) => {
    if (!canvas || !containerRef.current) return;

    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const canvasRatio = canvas.width / canvas.height;
    const containerRatio = containerWidth / containerHeight;

    let scale, newWidth, newHeight;

    if (canvasRatio > containerRatio) {
      scale = containerWidth / canvas.width;
      newWidth = containerWidth;
      newHeight = canvas.height * scale;
    } else {
      scale = containerHeight / canvas.height;
      newHeight = containerHeight;
      newWidth = canvas.width * scale;
    }

    canvas.setZoom(scale);
    canvas.setDimensions({ width: newWidth, height: newHeight });
    canvas.renderAll();
  };

  const updateLayers = (canvas) => {
    const objects = canvas.getObjects();
    setLayers(objects.map((obj, index) => ({
      id: obj.id || `object-${index}`,
      type: obj.type,
      name: `${obj.type} ${index + 1}`
    })));
  };

  const addText = () => {
    const text = new fabric.IText('New Text', {
      left: 100,
      top: 100,
      fontFamily: 'Arial',
      fill: '#ffffff',
      fontSize: 20
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    updateLayers(canvas);
  };

  const addImage = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (f) => {
      fabric.Image.fromURL(f.target.result, (img) => {
        img.scaleToWidth(200);
        canvas.add(img);
        canvas.setActiveObject(img);
        updateLayers(canvas);
      });
    };
    reader.readAsDataURL(file);
  };

  const addShape = () => {
    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      fill: '#ff0000',
      width: 100,
      height: 100
    });
    canvas.add(rect);
    canvas.setActiveObject(rect);
    updateLayers(canvas);
  };

  const deleteSelected = () => {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.remove(activeObject);
      updateLayers(canvas);
    }
  };

  const onDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index);
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const onDrop = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    const objects = canvas.getObjects();
    const [movedObject] = objects.splice(sourceIndex, 1);
    objects.splice(targetIndex, 0, movedObject);
    canvas.renderAll();
    updateLayers(canvas);
  };

  const downloadCanvas = () => {
    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2
    });
    const link = document.createElement('a');
    link.download = 'banner.png';
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const saveBanner = () => {
    const canvasJSON = JSON.stringify(canvas.toJSON());
    localStorage.setItem('editedCanvasData', canvasJSON);
    // Redirect to home or handle saving as needed
    // window.location.href = '/';
  };

  return (
    <div className="banner-editor">
      <header>
        <h1>Banner Editor</h1>
        <div>
          <button onClick={saveBanner} className="save-btn">
            <FaSave /> Save
          </button>
          <button onClick={downloadCanvas} className="download-btn">
            <FaDownload /> Download
          </button>
        </div>
      </header>
      <div className="editor-content">
        <div className="left-sidebar">
          <button onClick={addText}><FaFont /> Add Text</button>
          <label className="file-input-label">
            <FaImage /> Add Image
            <input type="file" onChange={addImage} accept="image/*" style={{display: 'none'}} />
          </label>
          <button onClick={addShape}><FaShapes /> Add Shape</button>
          <button onClick={deleteSelected}><FaTrash /> Delete</button>
        </div>

        <div className="canvas-container" ref={containerRef}>
          <canvas ref={canvasRef} />
        </div>

        <div className={`right-sidebar ${showRightSidebar ? 'open' : 'closed'}`}>
          <button 
            className="toggle-sidebar" 
            onClick={() => setShowRightSidebar(!showRightSidebar)}
          >
            {showRightSidebar ? <FaChevronRight /> : <FaChevronLeft />}
          </button>
          <h3><FaLayerGroup /> Layers</h3>
          <ul className="layer-list">
            {layers.map((layer, index) => (
              <li 
                key={layer.id} 
                draggable 
                onDragStart={(e) => onDragStart(e, index)}
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, index)}
              >
                {layer.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BannerEditor;