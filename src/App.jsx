import React, { useState, useRef, useEffect } from 'react';
import { fabric } from 'fabric';

const AIBannerGenerator = () => {
  const [promotion, setPromotion] = useState('');
  const [theme, setTheme] = useState('');
  const [colorPalette, setColorPalette] = useState(['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A']);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [outputType, setOutputType] = useState('1920x600');
  const [generatedBannerUrl, setGeneratedBannerUrl] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);

  useEffect(() => {
    fabricCanvasRef.current = new fabric.Canvas(canvasRef.current, {
      width: 1,  // Set to 1 to essentially hide it
      height: 1
    });
    console.log('Fabric canvas initialized');
    return () => {
      fabricCanvasRef.current.dispose();
      console.log('Fabric canvas disposed');
    };
  }, []);

  useEffect(() => {
    console.log('generatedBannerUrl changed:', generatedBannerUrl ? 'Set' : 'Not set');
  }, [generatedBannerUrl]);

  useEffect(() => {
    return () => {
      if (generatedBannerUrl) {
        URL.revokeObjectURL(generatedBannerUrl);
      }
    };
  }, [generatedBannerUrl]);

  const handleColorChange = (index, color) => {
    const newPalette = [...colorPalette];
    newPalette[index] = color;
    setColorPalette(newPalette);
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    setUploadedImages([...uploadedImages, ...files]);
  };

  const generateContent = async () => {
    if (uploadedImages.length === 0) {
      setError('Please upload at least one image.');
      return;
    }

    setError('');
    setLoading(true);
    setGeneratedBannerUrl(null); // Reset the banner URL

    try {
      const imageDataList = await Promise.all(uploadedImages.map(readFileAsDataURL));

      const requestData = {
        promotion,
        theme,
        resolution: getResolution(),
        color_palette: colorPalette,
        images: imageDataList.map(data => data.split(',')[1])
      };
      console.log('Sending request data:', requestData);
      const response = await fetch('http://localhost:5000/generate_banner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const bannerData = await response.json();
      console.log("Received banner data:", bannerData);
      renderBanner(bannerData);
    } catch (error) {
      console.error('Error:', error);
      setError(`An error occurred: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderBanner = (bannerData) => {
    console.log('Received bannerData:', JSON.stringify(bannerData, null, 2));
    
    const canvas = fabricCanvasRef.current;
    canvas.clear();
    canvas.setWidth(bannerData.width);
    canvas.setHeight(bannerData.height);

    const renderPromises = bannerData.objects.map((obj, index) => {
      console.log(`Processing object ${index}:`, JSON.stringify(obj, null, 2));
      
      return new Promise((resolve, reject) => {
        if (obj.type === 'image') {
          if (!obj.src || typeof obj.src !== 'string') {
            console.error(`Invalid image data for object ${index}:`, obj.src);
            reject(new Error(`Invalid image data for object ${index}`));
            return;
          }

          fabric.Image.fromURL(obj.src, (img) => {
            if (!img) {
              console.error(`Failed to load image for object ${index}`);
              reject(new Error(`Image load failed for object ${index}`));
              return;
            }
            
            const scaleX = (parseFloat(obj.width) / 100) * canvas.width / img.width;
            const scaleY = (parseFloat(obj.height) / 100) * canvas.height / img.height;
            
            img.set({
              left: (parseFloat(obj.left) / 100) * canvas.width,
              top: (parseFloat(obj.top) / 100) * canvas.height,
              scaleX: scaleX,
              scaleY: scaleY,
              selectable: false
            });
            canvas.add(img);
            console.log(`Image for object ${index} added successfully`);
            resolve();
          }, { crossOrigin: 'anonymous' });
        } else if (obj.type === 'text') {
          const text = new fabric.Text(obj.text || '', {
            left: (parseFloat(obj.left) / 100) * canvas.width,
            top: (parseFloat(obj.top) / 100) * canvas.height,
            fontSize: obj.fontSize,
            fill: obj.fill,
            fontWeight: obj.fontWeight,
            fontStyle: obj.fontStyle,
            fontFamily: obj.fontFamily,
            textAlign: obj.textAlign,
            selectable: false
          });
          canvas.add(text);
          console.log(`Text object ${index} added:`, obj.text);
          resolve();
        } else {
          console.warn(`Unknown object type for object ${index}:`, obj.type);
          resolve();
        }
      });
    });

    Promise.all(renderPromises)
      .then(() => {
        console.log('All objects rendered');
        canvas.renderAll();
        console.log('Canvas rendered');
        
        // Force a re-render of the canvas
        canvas.setZoom(1);
        canvas.setZoom(1.00001);
        
        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setGeneratedBannerUrl(url);
            console.log('Generated banner state updated with blob URL:', url);
          } else {
            console.error('Failed to create blob from canvas');
          }
        }, 'image/png');
      })
      .catch(error => {
        console.error('Error in Promise.all:', error);
        setError('Failed to render some objects. Please check the console for details.');
      });
  };

  const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const getResolution = () => {
    if (outputType === 'custom') {
      return `${customWidth}x${customHeight}`;
    }
    return outputType;
  };

  return (
    <div className="ai-banner-generator">
      <h1>AI Banner Generator</h1>
      <div className="content-wrapper">
        <div className="input-section">
          <div className="input-group">
            <label>🎉 Promotion</label>
            <input
              type="text"
              value={promotion}
              onChange={(e) => setPromotion(e.target.value)}
              placeholder="Enter promotional offer details"
            />
          </div>
          <div className="input-group">
            <label>🌈 Theme</label>
            <input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="Enter theme (e.g., Summer, Diwali)"
            />
          </div>
          <div className="input-group">
            <label>🎨 Color Palette</label>
            <div className="color-palette">
              {colorPalette.map((color, index) => (
                <input
                  key={index}
                  type="color"
                  value={color}
                  onChange={(e) => handleColorChange(index, e.target.value)}
                />
              ))}
            </div>
          </div>
          <div className="input-group">
            <label>🖼️ Upload Images</label>
            <div className="file-upload">
              <button onClick={() => document.getElementById('fileInput').click()}>
                Choose Files
              </button>
              <span>{uploadedImages.length} file(s) selected</span>
            </div>
            <input
              id="fileInput"
              type="file"
              multiple
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
          </div>
          <div className="input-group">
            <label>🖥️ Resolution</label>
            <select
              value={outputType}
              onChange={(e) => setOutputType(e.target.value)}
            >
                    <option value="1920x600">1920x600</option>
                    <option value="1024x480">1024x480</option>
                    <option value="1200x600">1200x600</option>
                    <option value="1024x512">1024x512</option>
                    <option value="custom">Custom</option>
            </select>
          </div>
          <button onClick={generateContent} className="generate-button" disabled={loading}>
            Generate Banner ✨
          </button>
          {error && <div className="error-message">{error}</div>}
        </div>
        <div className="preview-section">
          <h2>Preview</h2>
          <div id="canvas-container" style={{ display: 'none' }}>
            <canvas ref={canvasRef} />
          </div>
          {generatedBannerUrl ? (
            <div id="image-preview-container" style={{ maxWidth: '100%', overflow: 'hidden' }}>
              <img 
                src={generatedBannerUrl} 
                alt="Generated Banner" 
                id="banner-preview" 
                style={{ 
                  width: '100%', 
                  height: 'auto', 
                  display: 'block'
                }} 
                onLoad={() => console.log('Banner image loaded successfully')}
                onError={(e) => console.error('Error loading banner image:', e)}
              />
            </div>
          ) : (
            <div>
              {console.log('Fallback displayed: No banner generated yet')}
              No banner generated yet
            </div>
          )}
          {loading && <div className="loading-overlay">Generating banner...</div>}
        </div>
      </div>
    </div>
  );
};

export default AIBannerGenerator;