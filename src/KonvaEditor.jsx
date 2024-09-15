import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Image, Text } from 'react-konva';
import { v4 as uuidv4 } from 'uuid';
import './NewBannerEditor.css';

const KonvaEditor = () => {
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [layers, setLayers] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [currentFont, setCurrentFont] = useState('Arial');
  const [currentColor, setCurrentColor] = useState('#000000');
  const stageRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const savedLayers = localStorage.getItem('canvasLayers');
    if (savedLayers) {
      setLayers(JSON.parse(savedLayers));
    }

    const savedSize = localStorage.getItem('canvasSize');
    if (savedSize) {
      setStageSize(JSON.parse(savedSize));
    }

    const handleResize = () => {
      if (stageRef.current) {
        const stage = stageRef.current;
        const container = stage.container();
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;
        const scale = Math.min(containerWidth / stageSize.width, containerHeight / stageSize.height);
        stage.width(stageSize.width * scale);
        stage.height(stageSize.height * scale);
        stage.scale({ x: scale, y: scale });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [stageSize]);

  useEffect(() => {
    localStorage.setItem('canvasLayers', JSON.stringify(layers));
  }, [layers]);

  const addText = () => {
    const newText = {
      id: uuidv4(),
      type: 'text',
      x: stageSize.width / 2,
      y: stageSize.height / 2,
      text: 'New Text',
      fontSize: 20,
      fontFamily: 'Arial',
      fill: '#000000',
      draggable: true,
    };
    setLayers([...layers, newText]);
    setSelectedId(newText.id);
  };

  const addImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const aspect = img.width / img.height;
        const width = Math.min(200, stageSize.width / 2);
        const height = width / aspect;
        const newImage = {
          id: uuidv4(),
          type: 'image',
          x: stageSize.width / 2 - width / 2,
          y: stageSize.height / 2 - height / 2,
          width: width,
          height: height,
          src: event.target.result,
          draggable: true,
        };
        setLayers([...layers, newImage]);
        setSelectedId(newImage.id);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const addShape = () => {
    const newShape = {
      id: uuidv4(),
      type: 'rect',
      x: stageSize.width / 2 - 50,
      y: stageSize.height / 2 - 50,
      width: 100,
      height: 100,
      fill: '#ff0000',
      draggable: true,
    };
    setLayers([...layers, newShape]);
    setSelectedId(newShape.id);
  };

  const handleSelect = (id) => {
    setSelectedId(id);
    const selectedObject = layers.find(layer => layer.id === id);
    if (selectedObject && selectedObject.type === 'text') {
      setCurrentFont(selectedObject.fontFamily);
      setCurrentColor(selectedObject.fill);
    }
  };

  const handleDragEnd = (e, id) => {
    const updatedLayers = layers.map(layer =>
      layer.id === id ? { ...layer, x: e.target.x(), y: e.target.y() } : layer
    );
    setLayers(updatedLayers);
  };

  const deleteSelected = () => {
    if (selectedId) {
      setLayers(layers.filter(layer => layer.id !== selectedId));
      setSelectedId(null);
    }
  };

  const bringToFront = () => {
    if (selectedId) {
      const updatedLayers = layers.filter(layer => layer.id !== selectedId);
      const selectedLayer = layers.find(layer => layer.id === selectedId);
      setLayers([...updatedLayers, selectedLayer]);
    }
  };

  const handleDownload = (format) => {
    const dataURL = stageRef.current.toDataURL({ pixelRatio: 2 });
    const link = document.createElement('a');
    link.download = `banner.${format}`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFontChange = (e) => {
    const newFont = e.target.value;
    setCurrentFont(newFont);
    if (selectedId) {
      const updatedLayers = layers.map(layer =>
        layer.id === selectedId && layer.type === 'text'
          ? { ...layer, fontFamily: newFont }
          : layer
      );
      setLayers(updatedLayers);
    }
  };

  const handleColorChange = (e) => {
    const newColor = e.target.value;
    setCurrentColor(newColor);
    if (selectedId) {
      const updatedLayers = layers.map(layer =>
        layer.id === selectedId ? { ...layer, fill: newColor } : layer
      );
      setLayers(updatedLayers);
    }
  };

  const handleZoom = (zoomIn) => {
    if (stageRef.current) {
      const stage = stageRef.current;
      const oldScale = stage.scaleX();
      const newScale = zoomIn ? oldScale * 1.1 : oldScale / 1.1;
      stage.scale({ x: newScale, y: newScale });
    }
  };

  return (
    <div className="banner-editor">
      <header className="toolbar">
        <div className="toolbar-left">
          <button onClick={() => handleDownload('png')}>PNG</button>
          <button onClick={() => handleDownload('jpeg')}>JPG</button>
        </div>
        <div className="toolbar-center">
          <select
            onChange={handleFontChange}
            value={currentFont}
            disabled={!selectedId || layers.find(layer => layer.id === selectedId)?.type !== 'text'}
          >
            <option value="Arial">Arial</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
            <option value="Verdana">Verdana</option>
          </select>
          <input
            type="color"
            onChange={handleColorChange}
            disabled={!selectedId}
            value={currentColor}
            title="Change Color"
          />
        </div>
        <div className="toolbar-right">
          <button onClick={bringToFront} disabled={!selectedId}>
            Bring to Front
          </button>
          <button onClick={() => handleZoom(true)}>Zoom In</button>
          <button onClick={() => handleZoom(false)}>Zoom Out</button>
        </div>
      </header>
      <div className="editor-content">
        <div className="left-sidebar">
          <button onClick={addText}>Add Text</button>
          <label className="file-input-label">
            Add Image
            <input
              ref={fileInputRef}
              type="file"
              onChange={addImage}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </label>
          <button onClick={addShape}>Add Shape</button>
          <button onClick={deleteSelected}>Delete</button>
        </div>
        <div className="canvas-wrapper">
          <Stage
            ref={stageRef}
            width={stageSize.width}
            height={stageSize.height}
            onMouseDown={(e) => {
              const clickedOnEmpty = e.target === e.target.getStage();
              if (clickedOnEmpty) {
                setSelectedId(null);
              }
            }}
          >
            <Layer>
              {layers.map((layer, index) => {
                if (layer.type === 'image') {
                  return (
                    <Image
                      key={layer.id}
                      id={layer.id}
                      x={layer.x}
                      y={layer.y}
                      width={layer.width}
                      height={layer.height}
                      image={new window.Image()}
                      src={layer.src}
                      draggable={layer.draggable}
                      onClick={() => handleSelect(layer.id)}
                      onTap={() => handleSelect(layer.id)}
                      onDragEnd={(e) => handleDragEnd(e, layer.id)}
                    />
                  );
                } else if (layer.type === 'text') {
                  return (
                    <Text
                      key={layer.id}
                      id={layer.id}
                      x={layer.x}
                      y={layer.y}
                      text={layer.text}
                      fontSize={layer.fontSize}
                      fontFamily={layer.fontFamily}
                      fill={layer.fill}
                      draggable={layer.draggable}
                      onClick={() => handleSelect(layer.id)}
                      onTap={() => handleSelect(layer.id)}
                      onDragEnd={(e) => handleDragEnd(e, layer.id)}
                    />
                  );
                } else if (layer.type === 'rect') {
                  return (
                    <Rect
                      key={layer.id}
                      id={layer.id}
                      x={layer.x}
                      y={layer.y}
                      width={layer.width}
                      height={layer.height}
                      fill={layer.fill}
                      draggable={layer.draggable}
                      onClick={() => handleSelect(layer.id)}
                      onTap={() => handleSelect(layer.id)}
                      onDragEnd={(e) => handleDragEnd(e, layer.id)}
                    />
                  );
                }
                return null;
              })}
            </Layer>
          </Stage>
        </div>
        <div className="right-sidebar">
          <h3>Layers</h3>
          <ul className="layer-list">
            {layers.map((layer, index) => (
              <li key={layer.id} onClick={() => handleSelect(layer.id)}>
                {layer.type} {index + 1}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default KonvaEditor;