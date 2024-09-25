import React, { useState, useEffect, useRef, useCallback } from 'react';
import { fabric } from 'fabric';
import BannerEditor from './NewBannerEditor';
import './AIBannerGenerator.css';
import ConfettiExplosion from 'react-confetti-explosion';
import { MdAddPhotoAlternate, MdImage } from 'react-icons/md';
import { LuBringToFront } from "react-icons/lu";
import { Tooltip } from 'react-tooltip'

const AIBannerGenerator = () => {
    const fontOptions = [
        "Arial",
        "Helvetica",
        "Times New Roman",
        "Courier",
        "Georgia",
        "Trebuchet MS",
        "Impact",
        "Comic Sans MS",
        "Brush Script MT",
        "Lucida Handwriting",
        "Monotype Corsiva",
        "Chalkboard",
        "Kristen ITC",
        "Segoe Print",
        "Segoe Script",
        "Arial Black",
        "Century Gothic",
        "Copperplate Gothic Light",
        "Franklin Gothic Medium",
        "Gill Sans MT",
        "Palatino Linotype",
        "Tahoma",
        "Verdana",
    ];
    const sampleThemes = ['aesthetic background, kitchen', 'fresh groceries advertisement banner, minimalistic', 'advertisement banner, minimalistic']
    const canvasRef = useRef(null);
    const [canvas, setCanvas] = useState(null);
    const [promotion, setPromotion] = useState('');
    const [theme, setTheme] = useState(sampleThemes[Math.floor(Math.random() * sampleThemes.length)]);
    const [resolution, setResolution] = useState('1360x800');
    const [customWidth, setCustomWidth] = useState('');
    const [customHeight, setCustomHeight] = useState('');
    const [colorPalette, setColorPalette] = useState(['#f7705c', '#a6fbff', '#a08cff', '#00ff97']);
    const [images, setImages] = useState([]);
    const [bannerPreview, setBannerPreview] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showBannerEditor, setShowBannerEditor] = useState(false);
    const [showThemeInput, setShowThemeInput] = useState(false);
    const [showModal, setShowModal] = useState(false); // New state for modal
    const modalCanvasRef = useRef(null);
    const [modalCanvas, setModalCanvas] = useState(null);
    const [selectedObject, setSelectedObject] = useState(null);
    const [renderedBannerTextData, setRenderedBannerTextData] = useState([])

    // for confetti
    const [isExploding, setIsExploding] = useState(false);

    useEffect(() => {
        const newCanvas = new fabric.Canvas(canvasRef.current);
        setCanvas(newCanvas);

        return () => {
            newCanvas.dispose();
        };
    }, []);

    const handleResolutionChange = (event) => {
        setResolution(event.target.value);
    };

    const handleColorChange = (index, event) => {
        const newPalette = [...colorPalette];
        newPalette[index] = event.target.value;
        setColorPalette(newPalette);
    };

    const handleImageUpload = (event) => {
        const files = Array.from(event.target.files);
        setImages(files);
    };

    const getResolution = () => {
        if (resolution === 'custom') {
            return `${customWidth}x${customHeight}`;
        }
        return resolution;
    };

    const togglePlaceholderAnimation = () => {
        const placeholder = document.getElementById('preview-placeholder');
        placeholder.classList.toggle('preview-placeholder-animate');
    };

    const generateBanner = async () => {  
        //this function is used to generate a banner
        //it is an async function because it is making a request to the server to generate a banner
        //it is returning a promise
        //so we are using async await to wait for the response from the server
        //and then we are setting the banner data to the state
        //and then we are rendering the banner
        setErrorMessage('');


        if (images.length === 0) {
            setErrorMessage('Please upload at least one image.');
            return;
        }

        setIsLoading(true);

        try {
            const imageDataList = await Promise.all(images.map(file => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            }));

            const requestData = {
                promotion,
                theme,
                resolution: getResolution(),
                color_palette: colorPalette,
                images: imageDataList
            };
            console.log('Request data:', requestData);
            const response = await fetch('http://localhost:5000/generate_banner', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const responseText = await response.text();
            let bannerData;
            try {
                bannerData = JSON.parse(responseText);
                console.log('Received banner data:', bannerData); 
            } catch (parseError) {
                console.error('Failed to parse JSON:', responseText);
                throw new Error(`Invalid JSON response: ${parseError.message}`);
            }

            if (!bannerData || typeof bannerData !== 'object') {
                throw new Error('Invalid banner data received');
            }

            renderBanner(bannerData);
        } catch (error) {
            console.error('Error:', error);
            setErrorMessage(`An error occurred: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const renderBanner = useCallback((bannerData) => {
        if (!canvas) return;

        canvas.clear();
        canvas.setWidth(bannerData.width);
        canvas.setHeight(bannerData.height);

        const loadImage = (src) => {
            return new Promise((resolve, reject) => {
                // Clean up the src URL
                const cleanSrc = src.replace(/^data:image\/[^;]+;base64,data:image\/[^;]+;base64,/, 'data:image/png;base64,');
                fabric.Image.fromURL(cleanSrc, (img) => {
                    resolve(img);
                }, { crossOrigin: 'anonymous' });
            });
        };

        const renderObjects = async () => {
            for (const obj of bannerData.objects) {
                if (obj.type === 'image') {
                    try {
                        const img = await loadImage(obj.src);
                        img.set({
                            left: parseFloat(obj.left) * canvas.width / 100,
                            top: obj.top ? parseFloat(obj.top) * canvas.height / 100 : 
                                 (obj.bottom ? canvas.height - parseFloat(obj.bottom) * canvas.height / 100 - img.height * parseFloat(obj.height) / 100 : 0),
                            scaleX: parseFloat(obj.width) / 100,
                            scaleY: parseFloat(obj.height) / 100,
                            selectable: false
                        });
                        canvas.add(img);
                        if (obj.left === '0%' && (obj.top === '0%' || obj.bottom === '0%')) {
                            canvas.sendToBack(img);
                        }
                    } catch (error) {
                        console.error('Error loading image:', error, 'Source:', obj.src);
                    }
                } else if (obj.type === 'text') {
                    const textWidth = parseFloat(obj.width) * canvas.width / 100;
                    const textbox = new fabric.Textbox(obj.text || 'Default Text', {
                        left: parseFloat(obj.left) * canvas.width / 100,
                        top: obj.top ? parseFloat(obj.top) * canvas.height / 100 : 
                             (obj.bottom ? canvas.height - parseFloat(obj.bottom) * canvas.height / 100 - parseFloat(obj.fontSize) : 0),
                        width: textWidth,
                        fontSize: obj.fontSize,
                        fill: obj.fill,
                        fontWeight: obj.fontWeight,
                        fontStyle: obj.fontStyle,
                        fontFamily: obj.fontFamily,
                        textAlign: obj.textAlign,
                        selectable: false,
                        splitByGrapheme: true,
                        breakWords: true
                    });
                    canvas.add(textbox);
                    setRenderedBannerTextData(prev=> prev + [textbox])
                }
            }
            canvas.renderAll();
        };

        renderObjects().then(() => {
            // Convert canvas to image after all objects are rendered
            const imageDataUrl = canvas.toDataURL({ format: 'png' });
            setBannerPreview(imageDataUrl);
            setIsExploding(true);
        });
    }, [canvas]);

    useEffect(() => {
        if (isExploding) {
            const timer = setTimeout(() => setIsExploding(false), 3000); // Reset after 3 seconds
            return () => clearTimeout(timer);
        }
    }, [isExploding]);

    const downloadBanner = () => {
        const link = document.createElement('a');
        link.download = 'generated_banner.png';
        link.href = bannerPreview;
        link.click();
    };

    const openAdvancedEditor = () => {
        const canvasJSON = JSON.stringify(canvas.toJSON());
        localStorage.setItem('canvasData', canvasJSON); 
        localStorage.setItem('canvasResolution', `${canvas.width}x${canvas.height}`);
        setShowModal(true);
    };


    useEffect(() => {
        if (showModal && modalCanvasRef.current) {
            const newCanvas = new fabric.Canvas(modalCanvasRef.current);
            setModalCanvas(newCanvas);

            const canvasData = localStorage.getItem('canvasData');
            if (canvasData) {
                newCanvas.loadFromJSON(canvasData, () => {
                    newCanvas.renderAll();
                    // Make background image unselectable
                    newCanvas.getObjects().forEach(obj => {
                        if (obj.type === 'image' && obj.left === 0 && obj.top === 0) {
                            obj.selectable = false;
                            obj.evented = false;
                        }
                    });
                });
            }

            const [width, height] = localStorage.getItem('canvasResolution').split('x').map(Number);
            newCanvas.setWidth(width);
            newCanvas.setHeight(height);
            
            //resize rendered canvas to rescale it so that doesn't go out of view
            const canvasContainer = document.querySelector(".canvas-container");
            let {scaledWidth, scaledHeight} = calculateScaledDimensions(width, height, 800)
            canvasContainer.style.width = `${scaledWidth}px`;
            canvasContainer.style.height = `${scaledHeight}px`;


            // Add event listener for object selection
            // newCanvas.on('selection:created', (e) => setSelectedObject(e.target));
            newCanvas.on('selection:created', (e) => {
                let activeObject = newCanvas.getActiveObject();
                console.log(activeObject)
                setSelectedObject(activeObject);
            });
            // newCanvas.on('selection:updated', (e) => setSelectedObject(e.target));
            newCanvas.on('selection:cleared', () => setSelectedObject(null));
            newCanvas.on('selection:updated', (e) => {
                let activeObject = newCanvas.getActiveObject();
                console.log(activeObject)
                setSelectedObject(activeObject);
            });


            return () => {
                newCanvas.dispose();
            };
        }
    }, [showModal]);

    const handleTextColorChange = (color) => {
        if (selectedObject && selectedObject.type === 'textbox') {
            selectedObject.set('fill', color);
            modalCanvas.renderAll();
        }
    };
    
    const handleFontSizeChange = (size) => {
        if (selectedObject && selectedObject.type === 'textbox') {
            selectedObject.set('fontSize', parseInt(size));
            modalCanvas.renderAll();
        }
    };

    const handleFontFamilyChange = (fontFamily) => {
        if (selectedObject && selectedObject.type === 'textbox') {
            selectedObject.set('fontFamily', fontFamily);
            modalCanvas.renderAll();
        }
    };

    const handleBringToFront = () => {
        if (selectedObject) {
            selectedObject.bringToFront();
            modalCanvas.renderAll();
        }
    };
    
    const handleImageUploadToCanvas = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                fabric.Image.fromURL(e.target.result, (img) => {
                    img.scaleToWidth(modalCanvas.width / 2); // Scale image appropriately
                    modalCanvas.add(img);
                    modalCanvas.setActiveObject(img)
                    modalCanvas.renderAll();
                });
            };
            reader.readAsDataURL(file);
        }
    }

    const handleBackgroundImageUpload = (event) => {
        const file = event.target.files[0];
        if (file && modalCanvas) { // Check if modalCanvas exists
            const reader = new FileReader();
            reader.onload = (e) => {
                fabric.Image.fromURL(e.target.result, (img) => {
                    img.set({
                        width: modalCanvas.width,
                        height: modalCanvas.height,
                        left: 0,
                        top: 0,
                        selectable: false,
                        evented: false
                    });
    
                    // Remove existing background image if present
                    modalCanvas.getObjects().forEach(obj => {
                        if (obj.type === 'image' && obj.left === 0 && obj.top === 0) {
                            modalCanvas.remove(obj);
                        }
                    });
    
                    modalCanvas.setBackgroundImage(img, () => {
                        modalCanvas.renderAll();
                        modalCanvas.backgroundImage.setCoords();
                    });
                });
            };
            reader.readAsDataURL(file);
        }
    };


    const closeModal = () => {
        if (modalCanvas) {
            const updatedCanvasJSON = JSON.stringify(modalCanvas.toJSON());
            localStorage.setItem('canvasData', updatedCanvasJSON);
            
            // Update the main canvas with changes from the modal
            canvas.loadFromJSON(updatedCanvasJSON, () => {
                canvas.renderAll();
                setBannerPreview(canvas.toDataURL({ format: 'png' }));
            });
        }
        setShowModal(false);
    };

    const getFallbackSize = () => {
        const containerWidth = 600; // Adjust this value based on your container's width
        let width, height;

        if (resolution === 'custom') {
            width = parseInt(customWidth, 10);
            height = parseInt(customHeight, 10);
        } else {
            [width, height] = resolution.split('x').map(Number);
        }

        const aspectRatio = width / height;
        const containerHeight = containerWidth / aspectRatio;

        return {
            width: `${containerWidth}px`,
            height: `${containerHeight}px`,
            maxWidth: '100%',
            maxHeight: '400px', // Adjust this value as needed
        };
    };

    const calculateScaledDimensions = (originalWidth, originalHeight, Width) => {
        const aspectRatio = originalWidth / originalHeight;
        let scaledWidth = Width;
        let scaledHeight = Width / aspectRatio;

        return { scaledWidth, scaledHeight };
    };

    const toggleThemeInput = () => {
        setShowThemeInput(!showThemeInput);
    };

    return (
        showBannerEditor ? <BannerEditor /> :  
        <>
     
        <div className="container">
        <div className="horizontal-line-break"></div>
        <h1>AI Banner Generator</h1>
            <div id="controls">
                <div className="input-group">
                    <label htmlFor="promotion">💹 Promotion:</label>
                    <input
                        type="text"
                        id="promotion"
                        placeholder="Enter promotional offer details (e.g., 50% off on all products)"
                        value={promotion}
                        onChange={(e) => setPromotion(e.target.value)}
                    />
                </div>
                <div className="input-group theme-group">
                    <label htmlFor="theme">
                        🌈 Theme: (Background)
                        {!showThemeInput && (
                            <button className="add-theme-btn" onClick={toggleThemeInput}>+</button>
                        )}
                    </label>
                    {showThemeInput && (
                        <div className="theme-input-container">
                            <input
                                type="text"
                                id="theme"
                                placeholder="Enter theme (e.g., Summer, Diwali)"
                                value={theme}
                                onChange={(e) => setTheme(e.target.value)}
                            />
                            <button className="hide-theme-btn" onClick={toggleThemeInput}>Hide</button>
                        </div>
                    )}
                </div>
                <div className="input-group">
                    <label htmlFor="color-palette">🎨 Color Palette:</label>
                    <div className="color-palette">
                        {colorPalette.map((color, index) => (
                            <input
                                key={index}
                                type="color"
                                id={`color${index + 1}`}
                                className="color-circle"
                                value={color}
                                onChange={(e) => handleColorChange(index, e)}
                            />
                        ))}
                    </div>
                </div>
                <div className="input-group">
                    <label htmlFor="images">🖼️ Upload Images:</label>
                    <input type="file" id="images" accept="image/*" multiple onChange={handleImageUpload} />
                    <div id="image-previews">
                        {images.map((image, index) => (
                            <img
                                key={index}
                                src={URL.createObjectURL(image)}
                                alt={`Preview ${index + 1}`}
                                className="image-preview"
                            />
                        ))}
                    </div>
                </div>
                <div className="input-group">
                    <label htmlFor="resolution">🖥️ Resolution:</label>
                    <select id="resolution" value={resolution} onChange={handleResolutionChange}>
                        <option value="1360x800">1360x800</option>
                        <option value="1920x600">1920x600</option>
                        <option value="1024x480">1024x480</option>
                        <option value="1024x512">1024x512</option>
                        <option value="custom">Custom</option>
                    </select>
                </div>
                {resolution === 'custom' && (
                    <div id="custom-resolution" style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="number"
                            id="custom-width"
                            placeholder="Width"
                            value={customWidth}
                            onChange={(e) => setCustomWidth(e.target.value)}
                        />
                        <input
                            type="number"
                            id="custom-height"
                            placeholder="Height"
                            value={customHeight}
                            onChange={(e) => setCustomHeight(e.target.value)}
                        />
                    </div>
                )}
                <button id="generate-button" onClick={generateBanner}>Generate Banner ✨</button>
            </div>

            <div id="image-preview-container">
                {bannerPreview ? (
                    <>
                       {isExploding && <ConfettiExplosion zIndex={1000} width={1000} particleCount={200}/>}
                        <img id="banner-preview" src={bannerPreview} alt="Banner Preview" />
                        <div className='banner-buttons-container'>
                            <button id="advanced-edit-button" onClick={openAdvancedEditor}>⚙️Edit Design</button>
                            <button id="download-button" onClick={downloadBanner}>Download Banner</button>
                        </div>
                    </>
                ) : (
                    <div 
                        id="preview-placeholder" 
                        style={{
                            ...getFallbackSize(),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px dashed #ccc',
                            borderRadius: '10px',
                            backgroundColor: '#0f0e18',
                            overflow: 'hidden',
                        }}
                    >
                        <div>Banner Preview Area ({resolution})</div>
                    </div>
                )}
            </div>

            {errorMessage && <div id="error-message">{errorMessage}</div>}

            {isLoading && (
                <div id="loading-overlay">
                    Generating Banner<span className='spinner'>✨</span>
                </div>
            )}
        </div>

        {/* Modal Overlay */}
        {showModal && (
            <div className="modal-overlay">
                <div className="modal-content">
                    <button className="close-button" onClick={closeModal}>×</button>
                    <h2>Advanced Editor</h2>
                    <div className='banner-customization-background-gradient-container'>
                        <div className="banner-customization">
                            <input 
                                type="color" 
                                value={selectedObject ? selectedObject.fill : "#dbfdff"}
                                onChange={(e) => handleTextColorChange(e.target.value)}
                                data-tooltip-id="text-color-tooltip"
                                data-tooltip-content="Text Color"
                            />
                            <Tooltip id="text-color-tooltip"/>
                            <input 
                                type="number" 
                                className='font-size-input'
                                placeholder = {selectedObject ? `${selectedObject.fontSize}` : "0"}
                                onChange={(e) => handleFontSizeChange(e.target.value)}
                                min="1"
                                max="100"
                                data-tooltip-id="font-size-tooltip" 
                                data-tooltip-content="Font Size"
                            />
                            <Tooltip id="font-size-tooltip"/>
                            <select 
                                value={selectedObject ? selectedObject.fontFamily : "Arial"}
                                onChange={(e) => handleFontFamilyChange(e.target.value)}
                                data-tooltip-id="font-family-tooltip"
                                data-tooltip-content="Font Family"
                            >
                                {/* adding font <option> tags */}
                                {fontOptions.map((font) => (
                                    <option key={font} value={font}>
                                        {font}
                                    </option>
                                ))}
                            </select>
                            <Tooltip id="font-family-tooltip"/>
                            {/* <div> */}
                                <button className='editor-btn' onClick={handleBringToFront} data-tooltip-id="bring-to-front-tooltip" data-tooltip-content="Bring to Front"><LuBringToFront /></button>
                                <Tooltip id="bring-to-front-tooltip"/>
                                {/* For image upload */}
                                <button className='editor-btn' onClick={() => {/* Trigger file input click */ document.getElementById('imageUpload').click(); }} data-tooltip-id="img-upload-tooltip" data-tooltip-content="Upload Image">
                                    <MdAddPhotoAlternate />
                                </button>
                                <Tooltip id="img-upload-tooltip" />
                                <input type="file" id="imageUpload" accept="image/*" onChange={handleImageUploadToCanvas} style={{ display: 'none' }} /> {/* Hidden input */}
                                {/* For Background image upload */}
                                <button className='editor-btn' onClick={() => {/* Trigger file input click */ document.getElementById('backgroundUpload').click(); }} data-tooltip-id="bg-img-upload-tooltip" data-tooltip-content="Custom Background Image" >
                                    <MdImage /> 
                                </button>
                                <Tooltip id="bg-img-upload-tooltip" />
                                <input type="file" id="backgroundUpload" accept="image/*" onChange={handleBackgroundImageUpload} style={{ display: 'none' }} /> {/* Hidden input */}
                            {/* </div> */}
                        </div>
                    </div>
                     <canvas ref={modalCanvasRef}></canvas>
                    <button onClick={closeModal} className="save-button">Save & Close</button>
                </div>
            </div>
        )}
        </>
    );
};

export default AIBannerGenerator;