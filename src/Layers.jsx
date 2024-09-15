import React from 'react';
import { FaLock, FaUnlock, FaArrowUp, FaArrowDown, FaAngleDoubleUp, FaAngleDoubleDown } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid'; // Add this import
import './Layers.css';

const Layers = ({ canvas, layers, setLayers, selectedObject }) => {
  const moveLayer = (index, direction) => {
    if (canvas) {
      const object = canvas.item(index);
      if (direction === 'up') canvas.bringForward(object);
      if (direction === 'down') canvas.sendBackwards(object);
      if (direction === 'top') canvas.bringToFront(object);
      if (direction === 'bottom') canvas.sendToBack(object);
      updateLayers();
    }
  };

  const toggleLock = (index) => {
    if (canvas) {
      const object = canvas.item(index);
      const newLockState = !object.lockMovementX;
      object.set({
        lockMovementX: newLockState,
        lockMovementY: newLockState,
        lockRotation: newLockState,
        lockScalingX: newLockState,
        lockScalingY: newLockState,
        selectable: !newLockState,
        evented: !newLockState,
      });
      canvas.renderAll();
      updateLayers();
    }
  };

  const updateLayers = () => {
    if (canvas) {
      setLayers(canvas.getObjects().map(obj => ({
        ...obj,
        id: obj.id || uuidv4(), // Use uuidv4() instead of fabric.util.uid()
      })));
    }
  };

  return (
    <div className="layers-sidebar">
      <h3>Layers</h3>
      <ul>
        {layers.map((layer, index) => (
          <li key={layer.id} className={selectedObject && layer.id === selectedObject.id ? 'selected' : ''}>
            <span>{layer.type}</span>
            <div className="layer-controls">
              <button onClick={() => moveLayer(index, 'up')}><FaArrowUp /></button>
              <button onClick={() => moveLayer(index, 'down')}><FaArrowDown /></button>
              <button onClick={() => moveLayer(index, 'top')}><FaAngleDoubleUp /></button>
              <button onClick={() => moveLayer(index, 'bottom')}><FaAngleDoubleDown /></button>
              <button onClick={() => toggleLock(index)}>
                {layer.lockMovementX ? <FaLock /> : <FaUnlock />}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Layers;
