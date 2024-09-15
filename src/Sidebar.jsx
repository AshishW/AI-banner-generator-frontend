import React, { useState, useEffect } from 'react';
import { SketchPicker } from 'react-color';
import './Sidebar.css';

const Sidebar = ({ activeTool, canvas, selectedObjects, layers }) => {
  const [textProperties, setTextProperties] = useState({
    fontFamily: 'Arial',
    fontSize: 20,
    fontWeight: 'normal',
    fontStyle: 'normal',
    textAlign: 'left',
    fill: '#000000',
    opacity: 1,
  });

  useEffect(() => {
    if (selectedObjects.length === 1 && selectedObjects[0].type === 'i-text') {
      const activeObject = selectedObjects[0];
      setTextProperties({
        fontFamily: activeObject.fontFamily,
        fontSize: activeObject.fontSize,
        fontWeight: activeObject.fontWeight,
        fontStyle: activeObject.fontStyle,
        textAlign: activeObject.textAlign,
        fill: activeObject.fill,
        opacity: activeObject.opacity,
      });
    }
  }, [selectedObjects]);

  const updateTextProperty = (property, value) => {
    if (selectedObjects.length === 1 && selectedObjects[0].type === 'i-text') {
      const activeObject = selectedObjects[0];
      activeObject.set(property, value);
      canvas.renderAll();
      setTextProperties(prev => ({ ...prev, [property]: value }));
    }
  };

  const renderTextProperties = () => (
    <div className="property-group">
      <div className="property-group-title">Text Properties</div>
      {/* ... (previous text property inputs) */}
    </div>
  );

  const toggleLock = () => {
    selectedObjects.forEach(obj => {
      obj.set('lockMovementX', !obj.lockMovementX);
      obj.set('lockMovementY', !obj.lockMovementY);
    });
    canvas.renderAll();
  };

  const renderLayers = () => (
    <div className="property-group">
      <div className="property-group-title">Layers</div>
      <ul>
        {layers.map((layer, index) => (
          <li key={layer.id}>
            {layer.name} ({layer.type})
            <button onClick={() => bringForward(index)}>↑</button>
            <button onClick={() => sendBackward(index)}>↓</button>
          </li>
        ))}
      </ul>
    </div>
  );

  const bringForward = (index) => {
    if (index < layers.length - 1) {
      canvas.bringForward(canvas.item(index));
      canvas.renderAll();
    }
  };

  const sendBackward = (index) => {
    if (index > 0) {
      canvas.sendBackwards(canvas.item(index));
      canvas.renderAll();
    }
  };

  return (
    <div className="sidebar">
      <h3>{activeTool} Properties</h3>
      {activeTool === 'text' && renderTextProperties()}
      <button onClick={toggleLock}>
        {selectedObjects.some(obj => obj.lockMovementX) ? 'Unlock' : 'Lock'}
      </button>
      {renderLayers()}
    </div>
  );
};

export default Sidebar;
