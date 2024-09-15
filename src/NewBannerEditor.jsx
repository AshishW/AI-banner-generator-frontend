import React, { useEffect, useRef, useState, useCallback, useLayoutEffect } from 'react';
import { fabric } from 'fabric';
import './NewBannerEditor.css';
import { v4 as uuidv4 } from 'uuid';

function BannerEditor() {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const isMounted = useRef(true);
    const [canvas, setCanvas] = useState(null);
    const [selectedObject, setSelectedObject] = useState(null);
    const [zoom, setZoom] = useState(1);
    const [currentFont, setCurrentFont] = useState('Arial');
    const [currentColor, setCurrentColor] = useState('#000000');
    const [layers, setLayers] = useState([]);

    const updateLayers = useCallback(() => {
        if (!canvas) return;
        const objects = canvas.getObjects();
        setLayers(objects.map((obj, index) => ({
            id: obj.id || `object-${index}`,
            type: obj.type,
            name: `${obj.type.charAt(0).toUpperCase() + obj.type.slice(1)} ${index + 1}`
        })));
    }, [canvas]);

    // New useEffect to save canvas state to localStorage whenever the canvas changes
    useEffect(() => {
        if (!canvas) return;

        const handleSave = () => {
            const json = canvas.toJSON(['isBackground']);
            localStorage.setItem('canvasData', JSON.stringify(json));
        };

        // Save on modification events
        canvas.on('object:added', handleSave);
        canvas.on('object:modified', handleSave);
        canvas.on('object:removed', handleSave);

        return () => {
            canvas.off('object:added', handleSave);
            canvas.off('object:modified', handleSave);
            canvas.off('object:removed', handleSave);
        };
    }, [canvas]);

    useLayoutEffect(() => {
        const resolution = localStorage.getItem('canvasResolution') || '800x600';
        const [width, height] = resolution.split('x').map(Number);

        if (canvasRef.current) {
            const newCanvas = new fabric.Canvas(canvasRef.current, {
                width,
                height,
                backgroundColor: '#ffffff',
                preserveObjectStacking: true,
            });

            setCanvas(newCanvas);
        }

        return () => {
            if (canvas) {
                canvas.dispose();
            }
        };
    }, []);

    useEffect(() => {
        if (!canvas) return;

        const initCanvas = async () => {
            try {
                const canvasData = JSON.parse(localStorage.getItem('canvasData'));

                if (canvasData && canvasData.objects) {
                    await loadObjects(canvas, canvasData.objects);
                }

                canvas.on('selection:created', handleSelection);
                canvas.on('selection:updated', handleSelection);
                canvas.on('selection:cleared', handleClearSelection);
                canvas.on('object:added', updateLayers);
                canvas.on('object:removed', updateLayers);
                canvas.on('object:modified', updateLayers);

                updateLayers();
            } catch (error) {
                console.error('Failed to parse canvas data:', error);
            }
        };

        initCanvas();

        return () => {
            canvas.off();
        };
    }, [canvas, updateLayers]);

    const loadObjects = async (canvas, objects) => {
        const loadPromises = objects.map(obj => {
            if (obj.type === 'image') {
                return new Promise((resolve) => {
                    fabric.Image.fromURL(obj.src, (img) => {
                        img.set({
                            left: obj.left,
                            top: obj.top,
                            scaleX: obj.scaleX,
                            scaleY: obj.scaleY,
                            selectable: !obj.isBackground, // Ensure images are selectable except background
                            evented: true,
                            ...obj
                        });
                        canvas.add(img);
                        if (obj.isBackground) {
                            canvas.sendToBack(img);
                        }
                        resolve();
                    }, { crossOrigin: 'anonymous' });
                });
            } else if (obj.type === 'i-text' || obj.type === 'text') {
                const text = new fabric.IText(obj.text, {
                    left: obj.left,
                    top: obj.top,
                    fontFamily: obj.fontFamily || 'Arial',
                    fill: obj.fill || '#000000',
                    fontSize: obj.fontSize || 20,
                    editable: true,
                    selectable: true, // Ensure text is selectable
                    ...obj
                });
                canvas.add(text);
                return Promise.resolve();
            } else if (obj.type === 'rect' || obj.type === 'circle' || obj.type === 'triangle') {
                const shape = new fabric[obj.type.charAt(0).toUpperCase() + obj.type.slice(1)]({
                    left: obj.left,
                    top: obj.top,
                    fill: obj.fill || '#ff0000',
                    width: obj.width || 100,
                    height: obj.height || 100,
                    selectable: true, // Ensure shapes are selectable
                    ...obj
                });
                canvas.add(shape);
                return Promise.resolve();
            } else {
                console.warn('Unsupported object type:', obj.type);
                return Promise.resolve();
            }
        });
        await Promise.all(loadPromises);
        canvas.renderAll();
    };

    const resizeCanvas = useCallback(() => {
        if (!canvas || !containerRef.current || !canvasRef.current) return;

        const container = containerRef.current;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const scaleX = containerWidth / canvas.width;
        const scaleY = containerHeight / canvas.height;
        const scale = Math.min(scaleX, scaleY) * 0.95;

        setZoom(scale);
        canvas.setZoom(scale);
        canvas.setDimensions({
            width: containerWidth,
            height: containerHeight,
        });
        canvas.renderAll();
    }, [canvas]);

    useEffect(() => {
        if (canvas) {
            resizeCanvas();
            window.addEventListener('resize', resizeCanvas);
        }

        return () => {
            window.removeEventListener('resize', resizeCanvas);
        };
    }, [canvas, resizeCanvas]);

    useEffect(() => {
        if (!canvas) return;

        const events = ['object:added', 'object:removed', 'object:modified'];
        events.forEach(event => canvas.on(event, updateLayers));

        return () => {
            events.forEach(event => canvas.off(event, updateLayers));
        };
    }, [canvas, updateLayers]);

    const handleSelection = (e) => {
        setSelectedObject(e.target);
        if (e.target && (e.target.type === 'i-text' || e.target.type === 'text')) {
            setCurrentFont(e.target.fontFamily);
            setCurrentColor(e.target.fill);
        }
    };

    const handleClearSelection = () => {
        setSelectedObject(null);
        setCurrentFont('Arial');
        setCurrentColor('#000000');
    };

    const addText = () => {
        if (!canvas) return;
        const text = new fabric.IText('New Text', {
            left: canvas.width / 2,
            top: canvas.height / 2,
            fontFamily: 'Arial',
            fill: '#000000',
            fontSize: 20,
            editable: true,
            selectable: true, // Ensure text is selectable
        });
        canvas.add(text);
        canvas.setActiveObject(text);
        canvas.renderAll();
        if (isMounted.current) {
            updateLayers();
        }
    };

    const addImage = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (f) => {
            fabric.Image.fromURL(f.target.result, (img) => {
                img.set({
                    left: canvas.width / 2 - 100,
                    top: canvas.height / 2 - 100,
                    scaleX: 0.5,
                    scaleY: 0.5,
                    selectable: true, // Ensure image is selectable
                    evented: true,
                });
                canvas.add(img);
                canvas.setActiveObject(img);
                canvas.renderAll();
                if (isMounted.current) {
                    updateLayers();
                }
            }, { crossOrigin: 'anonymous' });
        };
        reader.readAsDataURL(file);
    };

    const addShape = () => {
        if (!canvas) return;
        const rect = new fabric.Rect({
            left: canvas.width / 2 - 50,
            top: canvas.height / 2 - 50,
            fill: '#ff0000',
            width: 100,
            height: 100,
            selectable: true, // Ensure shape is selectable
        });
        canvas.add(rect);
        canvas.setActiveObject(rect);
        canvas.renderAll();
        if (isMounted.current) {
            updateLayers();
        }
    };

    const deleteSelected = () => {
        if (!canvas) return;
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
            canvas.remove(activeObject);
            canvas.renderAll();
            if (isMounted.current) {
                updateLayers();
            }
            setSelectedObject(null);
            setCurrentFont('Arial');
            setCurrentColor('#000000');
        }
    };

    const bringToFront = () => {
        if (!canvas || !selectedObject) return;
        canvas.bringToFront(selectedObject);
        canvas.requestRenderAll();
        if (isMounted.current) {
            updateLayers();
        }
    };

    const handleDownload = (format) => {
        const supportedFormats = ['png', 'jpeg'];
        if (!supportedFormats.includes(format)) {
            console.error('Unsupported format:', format);
            return;
        }
        if (!canvas) return;
        const dataURL = canvas.toDataURL({
            format: format,
            quality: 1
        });
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = `banner.${format}`;
        link.click();
    };

    const handleFontChange = (e) => {
        const newFont = e.target.value;
        setCurrentFont(newFont);
        if (selectedObject && (selectedObject.type === 'i-text' || selectedObject.type === 'text')) {
            selectedObject.set('fontFamily', newFont);
            canvas.requestRenderAll();
            updateLayers(); // Ensure layers are updated after change
        }
    };

    const handleColorChange = (e) => {
        const newColor = e.target.value;
        setCurrentColor(newColor);
        if (selectedObject) {
            selectedObject.set('fill', newColor);
            canvas.requestRenderAll();
            updateLayers(); // Ensure layers are updated after change
        }
    };

    const handleZoom = useCallback((zoomIn) => {
        setZoom(prevZoom => {
            let newZoom = zoomIn ? prevZoom * 1.1 : prevZoom / 1.1;
            newZoom = Math.min(Math.max(0.1, newZoom), 3);
            if (canvas) {
                canvas.setZoom(newZoom);
                canvas.setViewportTransform([newZoom, 0, 0, newZoom, 0, 0]);
                canvas.renderAll();
            }
            return newZoom;
        });
    }, [canvas]);

    return (
        <div className="banner-editor">
            <header className="toolbar">
                <div className="toolbar-left">
                    <button onClick={() => handleDownload('png')}>
                        PNG
                    </button>
                    <button onClick={() => handleDownload('jpeg')}>
                        JPG
                    </button>
                </div>
                <div className="toolbar-center">

                    <select
                        onChange={handleFontChange}
                        value={currentFont}
                        disabled={!selectedObject || (selectedObject.type !== 'i-text' && selectedObject.type !== 'text')}
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
                        disabled={!selectedObject}
                        value={currentColor}
                        title="Change Text Color"
                    />
                </div>
                <div className="toolbar-right">
                    <button onClick={bringToFront} disabled={!selectedObject}>
                        Bring to Front
                    </button>
                    <button onClick={() => handleZoom(true)}>
                        Zoom In
                    </button>
                    <button onClick={() => handleZoom(false)}>
                        Zoom Out
                    </button>
                </div>
            </header>
            <div className="editor-content">
                <div className="left-sidebar">
                    <button onClick={addText} aria-label="Add Text">
                        Add Text
                    </button>
                    <label className="file-input-label">
                        Add Image
                        <input type="file" onChange={addImage} accept="image/*" style={{ display: 'none' }} />
                    </label>
                    <button onClick={addShape} aria-label="Add Shape">
                        Add Shape
                    </button>
                    <button onClick={deleteSelected} aria-label="Delete Selected">
                        Delete
                    </button>
                </div>
                <div className="canvas-wrapper" ref={containerRef}>
                    <canvas ref={canvasRef} />
                </div>
                <div className="right-sidebar">
                    <h3> Layers</h3>
                    <ul className="layer-list">
                        {layers.map((layer, index) => (
                            <li key={layer.id}>
                                {layer.name}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default BannerEditor;