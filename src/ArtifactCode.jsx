import React, { useState, useEffect } from 'react';
import { Plus, Copy, Download, Upload, X, Edit, Trash2, Camera, Image, RefreshCw, MessageCircle, ChevronDown, ArrowRightLeft } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, onValue, push, update, remove } from 'firebase/database';

const ColorDocumentationTool = () => {
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showScreenshotModal, setShowScreenshotModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showPaletteModal, setShowPaletteModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showComponentEditModal, setShowComponentEditModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [editingComponentName, setEditingComponentName] = useState('');
  const [originalComponentName, setOriginalComponentName] = useState('');
  const [transferComponentName, setTransferComponentName] = useState('');
  const [transferComponentColors, setTransferComponentColors] = useState([]);
  const [settingsActiveTab, setSettingsActiveTab] = useState('palettes');
  const [editingPalette, setEditingPalette] = useState(null);
  const [deletingPalette, setDeletingPalette] = useState(null);
  const [editingProperty, setEditingProperty] = useState(null);
  const [editingModifier, setEditingModifier] = useState(null);
  const [newPropertyName, setNewPropertyName] = useState('');
  const [newModifierName, setNewModifierName] = useState('');
  const [editingColor, setEditingColor] = useState(null);
  const [commentingColor, setCommentingColor] = useState(null);
  
  // Palette management
  const [currentPalette, setCurrentPalette] = useState('web');
  const [palettes, setPalettes] = useState([
    { id: 'web', name: 'IVMS 3.0 Web', description: 'Web application colors', colors: [] },
    { id: 'mobile', name: 'IVMS 3.0 Mobile', description: 'Mobile application colors', colors: [] },
    { id: 'legacy', name: 'IVMS 4.X', description: 'Legacy version colors', colors: [] }
  ]);
  const [newPalette, setNewPalette] = useState({ name: '', description: '' });
  const [newColor, setNewColor] = useState({
    name: '',
    hex: '#000000',
    property: '',
    modifiers: [],
    component: '',
    comments: []
  });

  const [currentUsageItems, setCurrentUsageItems] = useState([]);
  const [uploadingScreenshots, setUploadingScreenshots] = useState({});
  const [newComment, setNewComment] = useState('');
  const [selectedComponents, setSelectedComponents] = useState([]);
  const [uploadingComponentScreenshot, setUploadingComponentScreenshot] = useState('');
  
  // State for component screenshots (separate from color screenshots)
  const [componentScreenshots, setComponentScreenshots] = useState({});

  const [filter, setFilter] = useState('All');
  const [componentFilter, setComponentFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('colors');
  const [hoveredComponent, setHoveredComponent] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const colorProperties = ['All', 'Text', 'Icon', 'Border', 'Background', 'Chart'];
  const colorModifiers = ['All', 'Primary', 'Secondary', 'Tertiary', 'Link', 'Selected', 'Hover', 'Disabled', 'Inverse', 'Brand', 'Danger', 'Warning', 'Success', 'Neutral', 'Map', 'Accent', 'Input'];
  const colorGroups = ['All', 'Primary', 'Secondary', 'Neutral', 'Success', 'Warning', 'Error', 'Info'];

  // State for managing custom properties and modifiers
  const [customProperties, setCustomProperties] = useState([]);
  const [customModifiers, setCustomModifiers] = useState([]);

  // Get all properties (default + custom)
  const getAllProperties = () => {
    return [...colorProperties, ...customProperties];
  };

  // Get all modifiers (default + custom)
  const getAllModifiers = () => {
    return [...colorModifiers, ...customModifiers];
  };

  // Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyD-gxhZLGZKCVRBAkOLg8UVc_Y2My2yX94",
    authDomain: "ivmscolors.firebaseapp.com",
    databaseURL: "https://ivmscolors-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "ivmscolors",
    storageBucket: "ivmscolors.firebasestorage.app",
    messagingSenderId: "35617288968",
    appId: "1:35617288968:web:d9410be73c552b819c72bd"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);

  // Generate token name automatically
  const generateTokenName = (property, modifiers, colorName = '') => {
    if (!property) return '';
    const prop = property.toLowerCase();
    
    if (modifiers && modifiers.length > 0) {
      // Check if accent is one of the modifiers
      const hasAccent = modifiers.some(m => m.toLowerCase() === 'accent');
      
      if (hasAccent && colorName) {
        // For accent modifier, include the color name
        const otherModifiers = modifiers.filter(m => m.toLowerCase() !== 'accent');
        const cleanColorName = colorName.toLowerCase().replace(/\s+/g, '');
        
        if (otherModifiers.length > 0) {
          const otherMods = otherModifiers.map(m => m.toLowerCase()).join('.');
          return `color.${prop}.${otherMods}.accent.${cleanColorName}`;
        } else {
          return `color.${prop}.accent.${cleanColorName}`;
        }
      } else {
        // Regular modifier handling
        const mods = modifiers.map(m => m.toLowerCase()).join('.');
        return `color.${prop}.${mods}`;
      }
    } else {
      return `color.${prop}.default`;
    }
  };

  // Get current palette data
  const getCurrentPalette = () => {
    return palettes.find(p => p.id === currentPalette) || palettes[0];
  };

  // Get unique component names from existing colors for filtering
  const getUniqueComponentNames = () => {
    const componentNames = new Set(['All']);
    colors.forEach(color => {
      if (color.component) {
        color.component.forEach(componentItem => {
          if (componentItem.name) {
            componentNames.add(componentItem.name);
          }
        });
      }
    });
    return Array.from(componentNames);
  };

  // Component colors by their usage components
  const getColorsByComponents = () => {
    const componentMap = new Map();
    
    colors.forEach(color => {
      if (color.component) {
        color.component.forEach(componentItem => {
          if (componentItem.name) {
            if (!componentMap.has(componentItem.name)) {
              componentMap.set(componentItem.name, []);
            }
            componentMap.get(componentItem.name).push({
              ...color,
              componentItem: componentItem
            });
          }
        });
      }
    });
    
    return componentMap;
  };

  // New function to handle component name editing
  const handleEditComponentName = (componentName) => {
    setOriginalComponentName(componentName);
    setEditingComponentName(componentName);
    setShowComponentEditModal(true);
  };

  // New function to save component name changes
  const handleSaveComponentName = async () => {
    if (editingComponentName.trim() && editingComponentName !== originalComponentName) {
      const updatedColors = colors.map(color => {
        if (color.component && color.component.some(comp => comp.name === originalComponentName)) {
          return {
            ...color,
            component: color.component.map(comp => 
              comp.name === originalComponentName 
                ? { ...comp, name: editingComponentName.trim() }
                : comp
            )
          };
        }
        return color;
      });
      
      setColors(updatedColors);
      await updateCurrentPaletteColors(updatedColors);
    }
    
    setShowComponentEditModal(false);
    setEditingComponentName('');
    setOriginalComponentName('');
  };

  // New function to handle component transfer
  const handleTransferComponent = (componentName) => {
    const componentColors = colors.filter(color => 
      color.component && color.component.some(comp => comp.name === componentName)
    );
    
    setTransferComponentName(componentName);
    setTransferComponentColors(componentColors);
    setShowTransferModal(true);
  };

  // New function to execute component transfer
  const handleExecuteTransfer = async (targetPaletteId) => {
    try {
      setSaving(true);
      
      // Get target palette data
      const targetPaletteRef = ref(database, `palettes/${targetPaletteId}`);
      const snapshot = await get(targetPaletteRef);
      
      let targetPaletteColors = {};
      if (snapshot.exists() && snapshot.val().colors) {
        targetPaletteColors = snapshot.val().colors;
      }
      
      // Add transferred colors to target palette
      transferComponentColors.forEach(color => {
        const colorId = `transferred_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        targetPaletteColors[colorId] = {
          ...color,
          lastUpdated: new Date().toISOString()
        };
        delete targetPaletteColors[colorId].id; // Remove id since it's now the key
      });
      
      // Save to target palette
      const targetColorsRef = ref(database, `palettes/${targetPaletteId}/colors`);
      await set(targetColorsRef, targetPaletteColors);
      
      alert(`Successfully transferred "${transferComponentName}" component with ${transferComponentColors.length} colors to the selected palette!`);
      
    } catch (error) {
      console.error('Error transferring component:', error);
      alert('Failed to transfer component. Please try again.');
    } finally {
      setSaving(false);
      setShowTransferModal(false);
      setTransferComponentName('');
      setTransferComponentColors([]);
    }
  };

  // Load component screenshots from Firebase
  const loadComponentScreenshots = async () => {
    try {
      const componentScreenshotsRef = ref(database, 'componentScreenshots');
      const snapshot = await get(componentScreenshotsRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const screenshots = {};
        
        // Flatten the nested structure for easy access
        Object.keys(data).forEach(paletteId => {
          Object.keys(data[paletteId]).forEach(componentName => {
            screenshots[`${paletteId}_${componentName}`] = data[paletteId][componentName].screenshot;
          });
        });
        
        setComponentScreenshots(screenshots);
      }
    } catch (error) {
      console.error('Error loading component screenshots:', error);
    }
  };

  // Load custom properties and modifiers from Firebase
  const loadCustomSettings = async () => {
    try {
      const customSettingsRef = ref(database, 'customSettings');
      const snapshot = await get(customSettingsRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        if (data.properties) {
          setCustomProperties(data.properties);
        }
        if (data.modifiers) {
          setCustomModifiers(data.modifiers);
        }
      }
    } catch (error) {
      console.error('Error loading custom settings:', error);
    }
  };

  // Save custom properties and modifiers to Firebase
  const saveCustomSettings = async (properties, modifiers) => {
    try {
      const customSettingsRef = ref(database, 'customSettings');
      await set(customSettingsRef, {
        properties: properties || customProperties,
        modifiers: modifiers || customModifiers,
        lastUpdated: new Date().toISOString()
      });
      console.log('Custom settings saved successfully!');
    } catch (error) {
      console.error('Error saving custom settings:', error);
      alert('Failed to save custom settings. Please check your internet connection.');
    }
  };

  // Load custom settings on component mount
  useEffect(() => {
    loadCustomSettings();
  }, []);

  // Load component screenshots on component mount
  useEffect(() => {
    loadComponentScreenshots();
  }, []);

  // Get component screenshot
  const getComponentScreenshot = (componentName) => {
    return componentScreenshots[`${currentPalette}_${componentName}`];
  };

  // Load colors from Firebase on component mount
  useEffect(() => {
    loadColorsFromFirebase();
  }, []);

  const loadColorsFromFirebase = async () => {
    try {
      setLoading(true);
      const palettesRef = ref(database, 'palettes');
      const snapshot = await get(palettesRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const palettesArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setPalettes(palettesArray);
        
        // Set current palette colors
        const activePalette = palettesArray.find(p => p.id === currentPalette);
        if (activePalette && activePalette.colors) {
          const colorsArray = Object.keys(activePalette.colors || {}).map(key => ({
            id: key,
            ...activePalette.colors[key]
          }));
          setColors(colorsArray);
        }
      } else {
        // Initialize with default palettes and sample data
        const defaultPalettes = {
          web: {
            name: 'IVMS 3.0 Web',
            description: 'Web application colors',
            colors: {
              color1: {
                name: 'Dark Navy Blue',
                hex: '#0E1038',
                tokenName: 'color.background.brand',
                property: 'Background',
                modifiers: ['Brand'],
                component: [
                  { name: 'Side Nav', screenshot: 'https://via.placeholder.com/300x200/0E1038/ffffff?text=Side+Navigation' },
                  { name: 'Headers', screenshot: 'https://via.placeholder.com/300x200/0E1038/ffffff?text=Page+Headers' },
                  { name: 'Primary backgrounds', screenshot: 'https://via.placeholder.com/300x200/0E1038/ffffff?text=Background' }
                ],
                comments: [
                  { id: 1, text: 'Primary background color for navigation and headers', author: 'Design Team', timestamp: new Date().toISOString() }
                ]
              },
              color2: {
                name: 'Royal Blue',
                hex: '#175CBA',
                tokenName: 'color.background.action-primary',
                property: 'Background',
                modifiers: ['action', 'Primary'],
                component: [
                  { name: 'CTA buttons', screenshot: 'https://via.placeholder.com/300x200/175CBA/ffffff?text=CTA+Button' },
                  { name: 'Links', screenshot: 'https://via.placeholder.com/300x200/175CBA/ffffff?text=Text+Links' },
                  { name: 'Active states', screenshot: 'https://via.placeholder.com/300x200/175CBA/ffffff?text=Active+State' }
                ],
                comments: [
                  { id: 1, text: 'Main interactive color for buttons and links', author: 'UX Team', timestamp: new Date().toISOString() }
                ]
              },
              color3: {
                name: 'Light Blue',
                hex: '#4A90E2',
                tokenName: 'color.background.hovered',
                property: 'Background',
                modifiers: ['Hovered'],
                component: [
                  { name: 'Button hover', screenshot: 'https://via.placeholder.com/300x200/4A90E2/ffffff?text=Button+Hover' },
                  { name: 'Link hover', screenshot: 'https://via.placeholder.com/300x200/4A90E2/ffffff?text=Link+Hover' },
                  { name: 'Icon hover', screenshot: 'https://via.placeholder.com/300x200/4A90E2/ffffff?text=Icon+Hover' }
                ],
                comments: []
              }
            }
          },
          mobile: {
            name: 'IVMS 3.0 Mobile',
            description: 'Mobile application colors',
            colors: {}
          },
          legacy: {
            name: 'IVMS 4.X',
            description: 'Legacy version colors',
            colors: {}
          }
        };
        
        await set(palettesRef, defaultPalettes);
        const palettesArray = Object.keys(defaultPalettes).map(key => ({
          id: key,
          ...defaultPalettes[key]
        }));
        setPalettes(palettesArray);
        
        // Set initial colors for web palette
        const webPalette = palettesArray.find(p => p.id === 'web');
        if (webPalette && webPalette.colors) {
          const colorsArray = Object.keys(webPalette.colors).map(key => ({
            id: key,
            ...webPalette.colors[key]
          }));
          setColors(colorsArray);
        }
      }
    } catch (error) {
      console.error('Error loading colors:', error);
      alert('Failed to load colors. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const saveColorsToFirebase = async (colorsToSave) => {
    try {
      setSaving(true);
      
      // Convert colors array to object with unique keys
      const colorsObject = {};
      colorsToSave.forEach(color => {
        const colorId = color.id || `color_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        colorsObject[colorId] = {
          ...color,
          lastUpdated: new Date().toISOString()
        };
        delete colorsObject[colorId].id; // Remove id since it's now the key
      });

      const paletteRef = ref(database, `palettes/${currentPalette}/colors`);
      await set(paletteRef, colorsObject);
      
      console.log('Colors saved successfully!');
    } catch (error) {
      console.error('Error saving colors:', error);
      alert('Failed to save colors. Please check your internet connection.');
    } finally {
      setSaving(false);
    }
  };

  // Setup real-time listener for current palette
  useEffect(() => {
    if (currentPalette) {
      const paletteRef = ref(database, `palettes/${currentPalette}`);
      const unsubscribe = onValue(paletteRef, (snapshot) => {
        if (snapshot.exists()) {
          const paletteData = snapshot.val();
          if (paletteData.colors) {
            const colorsArray = Object.keys(paletteData.colors).map(key => ({
              id: key,
              ...paletteData.colors[key]
            }));
            setColors(colorsArray);
          } else {
            setColors([]);
          }
        }
      });

      return () => unsubscribe();
    }
  }, [currentPalette]);

  // Load palettes on component mount
  useEffect(() => {
    loadPalettesFromFirebase();
    
    const refreshTimer = setTimeout(() => {
      if (colors.length === 0 && palettes.length > 0) {
        loadPalettesFromFirebase();
      }
    }, 1000);

    return () => clearTimeout(refreshTimer);
  }, []);

  useEffect(() => {
    if (currentPalette && palettes.length > 0 && colors.length === 0) {
      const palette = palettes.find(p => p.id === currentPalette);
      if (palette && palette.colors && palette.colors.length > 0) {
        setColors(palette.colors);
      }
    }
  }, [currentPalette, palettes, colors.length]);

  // Handle file upload and convert to base64
  const handleFileUpload = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject('No file selected');
        return;
      }

      if (!file.type.startsWith('image/')) {
        reject('Please select an image file');
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        reject('File size must be less than 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject('Failed to read file');
      reader.readAsDataURL(file);
    });
  };

  const handleScreenshotUpload = async (usageIndex, file) => {
    try {
      setUploadingScreenshots(prev => ({ ...prev, [usageIndex]: true }));
      const base64Image = await handleFileUpload(file);
      
      setCurrentUsageItems(prev => 
        prev.map((item, index) => 
          index === usageIndex 
            ? { ...item, screenshot: base64Image }
            : item
        )
      );
    } catch (error) {
      alert(error);
    } finally {
      setUploadingScreenshots(prev => ({ ...prev, [usageIndex]: false }));
    }
  };

  const handleComponentScreenshotUpload = async (componentName, file) => {
    try {
      setUploadingComponentScreenshot(componentName);
      const base64Image = await handleFileUpload(file);
      
      // Store component screenshot separately without updating individual colors
      const updatedComponentScreenshots = {
        ...componentScreenshots,
        [`${currentPalette}_${componentName}`]: base64Image
      };
      setComponentScreenshots(updatedComponentScreenshots);
      
      // Save component screenshots to Firebase separately
      const componentScreenshotsRef = ref(database, `componentScreenshots/${currentPalette}/${componentName}`);
      await set(componentScreenshotsRef, {
        screenshot: base64Image,
        lastUpdated: new Date().toISOString()
      });
      
      console.log('Component screenshot uploaded successfully!');
    } catch (error) {
      console.error('Error uploading component screenshot:', error);
      alert('Failed to upload screenshot. Please try again.');
    } finally {
      setUploadingComponentScreenshot('');
    }
  };

  const handleAddColor = () => {
    if (newColor.name && newColor.hex && newColor.property) {
      const componentItems = newColor.component.split(',').map(c => c.trim()).filter(c => c);
      const combinedComponents = [...selectedComponents, ...componentItems].filter((comp, index, arr) => arr.indexOf(comp) === index);
      setCurrentUsageItems(combinedComponents.map(item => ({
        name: item,
        screenshot: `https://via.placeholder.com/300x200/${newColor.hex.slice(1)}/ffffff?text=${encodeURIComponent(item)}`
      })));
      setShowAddModal(false);
      setShowScreenshotModal(true);
    }
  };

  const handleFinalizeAddColor = async () => {
    const tokenName = generateTokenName(newColor.property, newColor.modifiers, newColor.name);
    const color = {
      id: Date.now(),
      name: newColor.name,
      hex: newColor.hex,
      tokenName: tokenName,
      property: newColor.property,
      modifiers: newColor.modifiers.length > 0 ? newColor.modifiers : ['Default'],
      component: currentUsageItems,
      comments: []
    };
    const updatedColors = [...colors, color];
    setColors(updatedColors);
    await updateCurrentPaletteColors(updatedColors);
    
    setNewColor({ name: '', hex: '#000000', property: '', modifiers: [], component: '', comments: [] });
    setCurrentUsageItems([]);
    setSelectedComponents([]);
    setShowScreenshotModal(false);
  };

  const handleComponentHover = (componentItem, event) => {
    const rect = event.target.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
    setHoveredComponent(componentItem);
  };

  const handleComponentLeave = () => {
    setHoveredComponent(null);
  };

  const handleDeleteColor = async (id) => {
    const updatedColors = colors.filter(c => c.id !== id);
    setColors(updatedColors);
    await saveColorsToFirebase(updatedColors);
  };

  const handleEditColor = (color) => {
    setEditingColor({
      ...color,
      component: color.component ? color.component.map(c => c.name).join(', ') : ''
    });
    setCurrentUsageItems(color.component ? [...color.component] : []);
    setSelectedComponents([]);
    setShowEditModal(true);
  };

  const handleUpdateColor = async () => {
    if (editingColor.name && editingColor.hex && editingColor.property) {
      const tokenName = generateTokenName(editingColor.property, editingColor.modifiers, editingColor.name);
      const updatedColor = {
        ...editingColor,
        tokenName: tokenName,
        modifiers: editingColor.modifiers && editingColor.modifiers.length > 0 ? editingColor.modifiers : ['Default'],
        component: currentUsageItems || []
      };
      const updatedColors = colors.map(c => c.id === editingColor.id ? updatedColor : c);
      setColors(updatedColors);
      await updateCurrentPaletteColors(updatedColors);
      
      setEditingColor(null);
      setCurrentUsageItems([]);
      setSelectedComponents([]);
      setShowEditModal(false);
    }
  };

  const handleDeleteFromEdit = async () => {
    const updatedColors = colors.filter(c => c.id !== editingColor.id);
    setColors(updatedColors);
    await updateCurrentPaletteColors(updatedColors);
    
    setEditingColor(null);
    setCurrentUsageItems([]);
    setSelectedComponents([]);
    setShowEditModal(false);
  };

  const handleComment = (color) => {
    setCommentingColor(color);
    setNewComment('');
    setShowCommentModal(true);
  };

  const handleAddComment = async () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now(),
        text: newComment.trim(),
        author: 'Anonymous User',
        timestamp: new Date().toISOString()
      };
      
      const updatedColor = {
        ...commentingColor,
        comments: [...(commentingColor.comments || []), comment]
      };
      
      const updatedColors = colors.map(c => c.id === commentingColor.id ? updatedColor : c);
      setColors(updatedColors);
      await updateCurrentPaletteColors(updatedColors);
      
      setShowCommentModal(false);
      setCommentingColor(null);
      setNewComment('');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const exportData = () => {
    const dataStr = JSON.stringify(colors, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'color-palette.json';
    link.click();
  };

  // Filter functions
  const filteredColors = colors.filter(color => {
    const matchesProperty = filter === 'All' || color.property === filter || (color.modifiers && color.modifiers.includes(filter));
    
    // Search functionality
    const matchesSearch = searchQuery === '' || 
      color.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      color.tokenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      color.hex.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (color.component && color.component.some(comp => 
        (comp.name || comp).toLowerCase().includes(searchQuery.toLowerCase())
      ));
    
    return matchesProperty && matchesSearch;
  });

  const filteredColorsByComponents = () => {
    const componentMap = getColorsByComponents();
    
    // Apply search filter first
    const searchFilteredMap = new Map();
    componentMap.forEach((colorsInComponent, componentName) => {
      const filteredColors = colorsInComponent.filter(colorData => {
        return searchQuery === '' || 
          colorData.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          colorData.tokenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          colorData.hex.toLowerCase().includes(searchQuery.toLowerCase()) ||
          componentName.toLowerCase().includes(searchQuery.toLowerCase());
      });
      
      if (filteredColors.length > 0) {
        searchFilteredMap.set(componentName, filteredColors);
      }
    });
    
    // Then apply component filter
    if (componentFilter === 'All') {
      return searchFilteredMap;
    }
    
    const filtered = new Map();
    if (searchFilteredMap.has(componentFilter)) {
      filtered.set(componentFilter, searchFilteredMap.get(componentFilter));
    }
    return filtered;
  };

  // Load palettes from Firebase
  const loadPalettesFromFirebase = async () => {
    try {
      setLoading(true);
      
      const palettesRef = ref(database, 'palettes');
      const snapshot = await get(palettesRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        
        // Sort palettes to maintain consistent order
        const palettesArray = Object.keys(data)
          .sort((a, b) => {
            // Define the order for default palettes
            const defaultOrder = ['web', 'mobile', 'legacy'];
            const aIndex = defaultOrder.indexOf(a);
            const bIndex = defaultOrder.indexOf(b);
            
            // If both are default palettes, sort by their predefined order
            if (aIndex !== -1 && bIndex !== -1) {
              return aIndex - bIndex;
            }
            // If only 'a' is a default palette, it comes first
            if (aIndex !== -1) return -1;
            // If only 'b' is a default palette, it comes first
            if (bIndex !== -1) return 1;
            // For custom palettes, sort by creation time (assuming timestamp-based IDs)
            return a.localeCompare(b);
          })
          .map(key => ({
            id: key,
            ...data[key]
          }));
        
        setPalettes(palettesArray);
        
        let activePalette = palettesArray.find(p => p.id === currentPalette);
        if (!activePalette) {
          activePalette = palettesArray[0];
          setCurrentPalette(activePalette.id);
        }
        
        if (activePalette?.colors) {
          const colorsArray = Object.keys(activePalette.colors).map(key => ({
            id: key,
            ...activePalette.colors[key]
          }));
          setColors(colorsArray);
        } else {
          setColors([]);
        }
      } else {
        const defaultPalettes = [
          {
            id: 'web',
            name: 'IVMS 3.0 Web',
            description: 'Web application color palette',
            colors: []
          },
          {
            id: 'mobile',
            name: 'IVMS 3.0 Mobile',
            description: 'Mobile application color palette',
            colors: []
          },
          {
            id: 'legacy',
            name: 'IVMS 4.X',
            description: 'Legacy version color palette',
            colors: []
          }
        ];
        setPalettes(defaultPalettes);
        setCurrentPalette(defaultPalettes[0].id);
        setColors([]);
        await savePalettesToFirebase(defaultPalettes);
      }
    } catch (error) {
      console.error('Error loading palettes:', error);
      
      const defaultPalettes = [
        {
          id: 'web',
          name: 'IVMS 3.0 Web',
          description: 'Web application color palette',
          colors: []
        },
        {
          id: 'mobile',
          name: 'IVMS 3.0 Mobile', 
          description: 'Mobile application color palette',
          colors: []
        },
        {
          id: 'legacy',
          name: 'IVMS 4.X',
          description: 'Legacy version color palette',
          colors: []
        }
      ];
      setPalettes(defaultPalettes);
      setCurrentPalette(defaultPalettes[0].id);
      setColors([]);
      
      alert(`Failed to load palettes from Firebase: ${error.message}\n\nStarting with default palettes. You can add colors and they will be saved properly.`);
    } finally {
      setLoading(false);
    }
  };

  // Save palettes to Firebase
  const savePalettesToFirebase = async (palettesToSave) => {
    try {
      setSaving(true);
      
      const palettesObject = {};
      palettesToSave.forEach(palette => {
        palettesObject[palette.id] = {
          name: palette.name,
          description: palette.description,
          colors: palette.colors || {},
          lastUpdated: new Date().toISOString()
        };
      });

      const palettesRef = ref(database, 'palettes');
      await set(palettesRef, palettesObject);
      
      console.log('Palettes saved successfully!');
    } catch (error) {
      console.error('Error saving palettes:', error);
      alert('Failed to save palettes. Please check your internet connection.');
    } finally {
      setSaving(false);
    }
  };

  // Switch palette
  const switchPalette = (paletteId) => {
    const palette = palettes.find(p => p.id === paletteId);
    if (palette) {
      setCurrentPalette(paletteId);
      if (palette.colors && typeof palette.colors === 'object') {
        const colorsArray = Object.keys(palette.colors).map(key => ({
          id: key,
          ...palette.colors[key]
        }));
        setColors(colorsArray);
      } else {
        setColors([]);
      }
    }
  };

  // Property management functions
  const handleAddProperty = async () => {
    if (newPropertyName.trim() && !getAllProperties().includes(newPropertyName.trim())) {
      const updatedProperties = [...customProperties, newPropertyName.trim()];
      setCustomProperties(updatedProperties);
      setNewPropertyName('');
      await saveCustomSettings(updatedProperties, customModifiers);
    }
  };

  const handleRenameProperty = async (oldName, newName) => {
    if (newName.trim() && !getAllProperties().includes(newName.trim())) {
      if (colorProperties.includes(oldName)) {
        // Can't rename default properties
        alert('Cannot rename default properties');
        return;
      }
      
      const updatedProperties = customProperties.map(prop => prop === oldName ? newName.trim() : prop);
      setCustomProperties(updatedProperties);
      setEditingProperty(null);
      await saveCustomSettings(updatedProperties, customModifiers);
    }
  };

  const handleDeleteProperty = async (propertyName) => {
    if (colorProperties.includes(propertyName)) {
      alert('Cannot delete default properties');
      return;
    }
    
    const updatedProperties = customProperties.filter(prop => prop !== propertyName);
    setCustomProperties(updatedProperties);
    await saveCustomSettings(updatedProperties, customModifiers);
  };

  // Modifier management functions
  const handleAddModifier = async () => {
    if (newModifierName.trim() && !getAllModifiers().includes(newModifierName.trim())) {
      const updatedModifiers = [...customModifiers, newModifierName.trim()];
      setCustomModifiers(updatedModifiers);
      setNewModifierName('');
      await saveCustomSettings(customProperties, updatedModifiers);
    }
  };

  const handleRenameModifier = async (oldName, newName) => {
    if (newName.trim() && !getAllModifiers().includes(newName.trim())) {
      if (colorModifiers.includes(oldName)) {
        // Can't rename default modifiers
        alert('Cannot rename default modifiers');
        return;
      }
      
      const updatedModifiers = customModifiers.map(mod => mod === oldName ? newName.trim() : mod);
      setCustomModifiers(updatedModifiers);
      setEditingModifier(null);
      await saveCustomSettings(customProperties, updatedModifiers);
    }
  };

  const handleDeleteModifier = async (modifierName) => {
    if (colorModifiers.includes(modifierName)) {
      alert('Cannot delete default modifiers');
      return;
    }
    
    const updatedModifiers = customModifiers.filter(mod => mod !== modifierName);
    setCustomModifiers(updatedModifiers);
    await saveCustomSettings(customProperties, updatedModifiers);
  };

  const handleDeletePalette = async (paletteId) => {
    if (paletteId === 'web' || paletteId === 'mobile' || paletteId === 'legacy') {
      alert('Cannot delete default palettes');
      return;
    }

    try {
      // Remove from Firebase
      const paletteRef = ref(database, `palettes/${paletteId}`);
      await remove(paletteRef);
      
      // Update local state
      const updatedPalettes = palettes.filter(p => p.id !== paletteId);
      setPalettes(updatedPalettes);
      
      // Switch to first palette if current one was deleted
      if (currentPalette === paletteId) {
        const firstPalette = updatedPalettes[0];
        if (firstPalette) {
          switchPalette(firstPalette.id);
        }
      }
      
      setDeletingPalette(null);
      setShowSettingsModal(false);
    } catch (error) {
      console.error('Error deleting palette:', error);
      alert('Failed to delete palette. Please try again.');
    }
  };

  // Rename palette
  const handleRenamePalette = async (paletteId, newName, newDescription) => {
    try {
      const paletteRef = ref(database, `palettes/${paletteId}`);
      const palette = palettes.find(p => p.id === paletteId);
      
      await update(paletteRef, {
        name: newName,
        description: newDescription || '',
        lastUpdated: new Date().toISOString()
      });
      
      // Update local state
      const updatedPalettes = palettes.map(p => 
        p.id === paletteId 
          ? { ...p, name: newName, description: newDescription || '' }
          : p
      );
      setPalettes(updatedPalettes);
      
      setEditingPalette(null);
      setShowSettingsModal(false);
    } catch (error) {
      console.error('Error renaming palette:', error);
      alert('Failed to rename palette. Please try again.');
    }
  };

  const handleCreatePalette = async () => {
    if (newPalette.name) {
      // Use timestamp to ensure new palettes appear at the end
      const timestamp = Date.now();
      const paletteId = `custom_${timestamp}`;
      
      const palette = {
        id: paletteId,
        name: newPalette.name,
        description: newPalette.description || '',
        colors: {},
        createdAt: timestamp // Add creation timestamp for consistent ordering
      };
      
      try {
        const paletteRef = ref(database, `palettes/${paletteId}`);
        await set(paletteRef, {
          name: palette.name,
          description: palette.description,
          colors: palette.colors,
          createdAt: palette.createdAt,
          lastUpdated: new Date().toISOString()
        });
        
        // Update local state - add to the end of the array
        const updatedPalettes = [...palettes, palette];
        setPalettes(updatedPalettes);
        
        setNewPalette({ name: '', description: '' });
        setShowPaletteModal(false);
        switchPalette(paletteId);
      } catch (error) {
        console.error('Error creating palette:', error);
        alert('Failed to create palette. Please try again.');
      }
    }
  };

  // Update colors in current palette
  const updateCurrentPaletteColors = async (newColors) => {
    try {
      setSaving(true);
      
      // Convert colors array to object with unique keys for Firebase
      const colorsObject = {};
      newColors.forEach(color => {
        const colorId = color.id || `color_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        colorsObject[colorId] = {
          ...color,
          lastUpdated: new Date().toISOString()
        };
        delete colorsObject[colorId].id; // Remove id since it's now the key
      });

      // Save directly to Firebase
      const paletteColorsRef = ref(database, `palettes/${currentPalette}/colors`);
      await set(paletteColorsRef, colorsObject);
      
      // Update local palette state
      const updatedPalettes = palettes.map(palette => 
        palette.id === currentPalette 
          ? { ...palette, colors: newColors }
          : palette
      );
      setPalettes(updatedPalettes);
      
      console.log('Colors updated successfully!');
    } catch (error) {
      console.error('Error updating colors:', error);
      alert('Failed to update colors. Please check your internet connection.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading color documentation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full">
        {/* Header */}
        <div className="bg-white">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between h-10">
              {/* Left Section */}
              <div className="flex items-center h-full">
                <img 
                  src="https://i.ibb.co/KjYpVDd4/image-1.png" 
                  alt="IVMS Logo" 
                  className="w-10 h-10 object-contain"
                />
                <h1 className="text-base font-medium text-gray-900 ml-3">IVMS Color Documentation</h1>
                
                {/* Separator */}
                <div className="w-px h-6 bg-gray-200 ml-6 mr-6"></div>
                
                {/* Palette Tabs with Add Button */}
                <div className="flex items-center h-full">
                  {palettes.map((palette, index) => (
                    <div key={palette.id} className="flex items-center h-full">
                      {index > 0 && <div className="w-px h-6 bg-gray-200"></div>}
                      <button
                        onClick={() => switchPalette(palette.id)}
                        className={`px-4 h-full flex items-center text-sm transition-colors ${
                          currentPalette === palette.id
                            ? 'text-gray-900 font-medium'
                            : 'text-gray-500 hover:text-gray-700 font-normal'
                        }`}
                      >
                        {palette.name}
                      </button>
                    </div>
                  ))}
                  
                  {/* Add New Palette Button */}
                  <div className="w-px h-6 bg-gray-200 ml-4"></div>
                  <button
                    onClick={() => setShowPaletteModal(true)}
                    className="p-2 ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors"
                    title="Create new palette"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-3">
                <button
                  onClick={exportData}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors"
                  title="Export data"
                >
                  <Download size={18} />
                </button>
                <button
                  onClick={loadPalettesFromFirebase}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors"
                  disabled={loading}
                  title="Refresh"
                >
                  <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                </button>
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors"
                  title="Palette settings"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Color Palette Overview */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mx-6 mt-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-md font-medium text-gray-900">All Colors ({colors.length})</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors text-sm font-normal"
              disabled={saving}
            >
              <Plus size={16} />
              Add Color
              {saving && <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full ml-1"></div>}
            </button>
          </div>
          
          {/* Colors with visual gaps between property groups */}
          {(() => {
            const colorsByProperty = colors.reduce((acc, color) => {
              const property = color.property || 'Other';
              if (!acc[property]) {
                acc[property] = [];
              }
              acc[property].push(color);
              return acc;
            }, {});

            return (
              <div className="flex flex-wrap gap-2">
                {Object.entries(colorsByProperty).map(([property, propertyColors], groupIndex) => (
                  <div key={property} className="flex flex-wrap gap-2">
                    {/* Add larger gap before group (except first group) */}
                    {groupIndex > 0 && <div className="w-4"></div>}
                    
                    {/* Colors in this property group */}
                    {propertyColors.map((color) => (
                      <div
                        key={color.id}
                        className="w-10 h-10 rounded border border-gray-200 relative group cursor-pointer transform hover:scale-110 transition-transform shadow-sm hover:shadow-md bg-white"
                        style={{ backgroundColor: color.hex }}
                        title={`${color.name} - ${color.hex}`}
                      >
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded flex items-center justify-center">
                          <button
                            onClick={() => copyToClipboard(color.hex)}
                            className="opacity-0 group-hover:opacity-100 bg-white p-1 rounded border border-gray-200 shadow-sm"
                          >
                            <Copy size={8} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
                
                {/* Empty State */}
                {colors.length === 0 && (
                  <div className="w-full text-center py-12">
                    <div className="text-gray-400 text-4xl mb-4">🎨</div>
                    <h3 className="text-base font-normal text-gray-800 mb-2">No colors yet</h3>
                    <p className="text-gray-600 text-sm">Add your first color to get started</p>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Modern Tabs */}
        <div className="px-6 mb-8 mt-12">
          <div className="bg-gray-50 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('colors')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === 'colors'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              View by Colors
            </button>
            <button
              onClick={() => setActiveTab('components')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === 'components'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              View by Components
            </button>
          </div>
        </div>

        {/* Modern Filter Pills */}
        {activeTab === 'colors' && (
          <div className="px-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Filter by Property:</span>
                <div className="flex flex-wrap gap-2">
                  {getAllProperties().map((property) => (
                    <button
                      key={property}
                      onClick={() => setFilter(property)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all ${
                        filter === property
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                      }`}
                    >
                      {property}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search colors, tokens, components..."
                  className="pl-8 pr-4 py-2 w-64 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                />
                <svg
                  className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'components' && (
          <div className="px-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Filter by Component:</span>
                <div className="flex flex-wrap gap-2">
                  {getUniqueComponentNames().map((componentName) => (
                    <button
                      key={componentName}
                      onClick={() => setComponentFilter(componentName)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all ${
                        componentFilter === componentName
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                      }`}
                    >
                      {componentName}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search colors, tokens, components..."
                  className="pl-8 pr-4 py-2 w-64 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                />
                <svg
                  className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Color Table - View by Colors */}
        {activeTab === 'colors' && (
          <div className="px-6">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-700 text-sm">Color</th>
                    <th className="text-left p-4 font-medium text-gray-700 text-sm">Token Name</th>
                    <th className="text-left p-4 font-medium text-gray-700 text-sm">Property</th>
                    <th className="text-left p-4 font-medium text-gray-700 text-sm">Modifiers</th>
                    <th className="text-left p-4 font-medium text-gray-700 text-sm">Component</th>
                    <th className="text-left p-4 font-medium text-gray-700 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredColors.map((color) => (
                    <tr key={color.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-left">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded border border-gray-200 shadow-sm"
                            style={{ backgroundColor: color.hex }}
                          ></div>
                          <div>
                            <div className="font-medium text-gray-900 text-sm text-left">{color.name}</div>
                            <div className="text-xs text-gray-500 font-mono text-left">{color.hex}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-left">
                        <div className="font-mono text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200 inline-block">
                          {color.tokenName}
                        </div>
                      </td>
                      <td className="p-4 text-left">
                        <span className="inline-block px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium border border-purple-200">
                          {color.property}
                        </span>
                      </td>
                      <td className="p-4 text-left">
                        <div className="flex flex-wrap gap-1">
                          {color.modifiers && color.modifiers.map((modifier, index) => (
                            <span key={index} className="inline-block px-2 py-0.5 bg-gray-50 text-gray-600 rounded text-xs font-normal border border-gray-200">
                              {modifier}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-left">
                        <div className="flex flex-wrap gap-1">
                          {color.component && Array.isArray(color.component) && color.component.map((componentItem, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs cursor-pointer hover:bg-green-100 transition-colors border border-green-200"
                              onMouseEnter={(e) => handleComponentHover(componentItem, e)}
                              onMouseLeave={handleComponentLeave}
                            >
                              {componentItem.screenshot && !componentItem.screenshot.includes('placeholder') && (
                                <Camera size={10} className="text-green-600" />
                              )}
                              {componentItem.name || componentItem}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-left">
                        <div className="flex gap-1">
                          <button
                            onClick={() => copyToClipboard(color.hex)}
                            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                            title="Copy hex code"
                          >
                            <Copy size={14} />
                          </button>
                          <button
                            onClick={() => handleEditColor(color)}
                            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                            title="Edit color"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleComment(color)}
                            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors relative"
                            title="Add comment"
                          >
                            <MessageCircle size={14} />
                            {color.comments && color.comments.length > 0 && (
                              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-gray-900 text-white text-[10px] rounded-full flex items-center justify-center">
                                {color.comments.length}
                              </span>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Component Cards - View by Components */}
        {activeTab === 'components' && (
          <div className="px-6 space-y-8">
            {Array.from(filteredColorsByComponents()).map(([componentName, colorsInComponent]) => {
              const colorsByProperty = colorsInComponent.reduce((acc, colorData) => {
                const property = colorData.property || 'Other';
                if (!acc[property]) {
                  acc[property] = [];
                }
                acc[property].push(colorData);
                return acc;
              }, {});

              return (
                <div key={componentName} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  {/* Component Header with Action Buttons */}
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-medium text-gray-900 flex items-center gap-3">
                        {componentName}
                        <span className="text-sm font-normal text-gray-500">({colorsInComponent.length} colors)</span>
                      </h3>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditComponentName(componentName)}
                          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                          title="Edit component name"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleTransferComponent(componentName)}
                          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                          title="Copy and transfer to another palette"
                        >
                          <ArrowRightLeft size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Two Column Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-2">
                    
                    {/* Left Column - Colors grouped by Property */}
                    <div className="p-6 border-r border-gray-200">
                      <div className="space-y-6">
                        {Object.entries(colorsByProperty).map(([property, propertyColors], propertyIndex) => (
                          <div key={property}>
                            {/* Property Header */}
                            <div className="flex items-center gap-2 mb-3">
                              <span className="inline-block px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium border border-purple-200">
                                {property}
                              </span>
                              <div className="flex-1 h-px bg-gray-200"></div>
                            </div>
                            
                            {/* Colors in this Property */}
                            <div className="space-y-2">
                              {propertyColors.map((colorData) => (
                                <div key={`${colorData.id}-${componentName}`} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded transition-colors group">
                                  {/* Color Swatch */}
                                  <div
                                    className="w-10 h-10 rounded border border-gray-200 flex-shrink-0"
                                    style={{ backgroundColor: colorData.hex }}
                                  ></div>
                                  
                                  {/* Color Details */}
                                  <div className="w-48 min-w-0 text-left">
                                    <div className="font-normal text-gray-900 text-sm text-left truncate">{colorData.name}</div>
                                    <div className="text-xs text-gray-500 font-mono text-left">{colorData.hex}</div>
                                  </div>
                                  
                                  {/* Token Name */}
                                  <div className="flex-shrink-0 max-w-xs">
                                    <div className="font-mono text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200 truncate text-left">
                                      {colorData.tokenName}
                                    </div>
                                  </div>
                                  
                                  {/* Actions */}
                                  <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => copyToClipboard(colorData.hex)}
                                      className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-colors"
                                      title="Copy hex code"
                                    >
                                      <Copy size={12} />
                                    </button>
                                    <button
                                      onClick={() => handleEditColor(colorData)}
                                      className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-colors"
                                      title="Edit color"
                                    >
                                      <Edit size={12} />
                                    </button>
                                    <button
                                      onClick={() => handleComment(colorData)}
                                      className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-colors relative"
                                      title="Add comment"
                                    >
                                      <MessageCircle size={12} />
                                      {colorData.comments && colorData.comments.length > 0 && (
                                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-gray-900 text-white text-[8px] rounded-full flex items-center justify-center">
                                          {colorData.comments.length}
                                        </span>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right Column - Component Screenshot */}
                    <div className="p-6 bg-gray-50 flex flex-col relative">
                      <div className="flex-1 flex items-center justify-center">
                        {getComponentScreenshot(componentName) ? (
                          <div className="w-full max-w-md">
                            <img
                              src={getComponentScreenshot(componentName)}
                              alt={`Screenshot of ${componentName} component`}
                              className="w-full h-auto rounded-lg border border-gray-200 bg-white"
                            />
                            <p className="text-sm text-gray-600 text-center mt-3">
                              {componentName} Component
                            </p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center mb-4 mx-auto">
                              <Camera size={32} className="text-gray-400" />
                            </div>
                            <h5 className="font-normal text-gray-700 mb-2">{componentName}</h5>
                            <p className="text-sm text-gray-500 mb-4">No screenshot available</p>
                            <label className="cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleComponentScreenshotUpload(componentName, e.target.files?.[0])}
                                className="hidden"
                                disabled={uploadingComponentScreenshot === componentName}
                              />
                              <div className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-normal rounded transition-colors ${
                                uploadingComponentScreenshot === componentName
                                  ? 'bg-gray-100 text-gray-600 cursor-not-allowed'
                                  : 'bg-gray-900 text-white hover:bg-gray-800'
                              }`}>
                                {uploadingComponentScreenshot === componentName ? (
                                  <>
                                    <div className="animate-spin w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full"></div>
                                    Uploading...
                                  </>
                                ) : (
                                  <>
                                    <Upload size={16} />
                                    Add Screenshot
                                  </>
                                )}
                              </div>
                            </label>
                          </div>
                        )}
                      </div>
                      
                      {/* Replace Screenshot Button */}
                      {getComponentScreenshot(componentName) && (
                        <div className="absolute bottom-4 right-4">
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleComponentScreenshotUpload(componentName, e.target.files?.[0])}
                              className="hidden"
                              disabled={uploadingComponentScreenshot === componentName}
                            />
                            <div className={`p-2 rounded border transition-colors ${
                              uploadingComponentScreenshot === componentName
                                ? 'bg-gray-100 text-gray-600 border-gray-300 cursor-not-allowed'
                                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                            }`} title="Replace screenshot">
                              {uploadingComponentScreenshot === componentName ? (
                                <div className="animate-spin w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full"></div>
                              ) : (
                                <Upload size={16} />
                              )}
                            </div>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Empty State */}
            {Array.from(filteredColorsByComponents()).length === 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                <div className="text-gray-400 text-5xl mb-4">🎨</div>
                <h3 className="text-base font-normal text-gray-800 mb-2">No components found</h3>
                <p className="text-gray-600 text-sm">Add some colors with component usage to see them organized here.</p>
              </div>
            )}
          </div>
        )}

        {/* Component Edit Modal */}
        {showComponentEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-medium">Edit Component Name</h3>
                <button
                  onClick={() => setShowComponentEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-normal text-gray-700 mb-1.5">Component Name</label>
                  <input
                    type="text"
                    value={editingComponentName}
                    onChange={(e) => setEditingComponentName(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                    placeholder="e.g., Button, Navigation, Card"
                    autoFocus
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowComponentEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveComponentName}
                  className="flex-1 px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors"
                  disabled={!editingComponentName.trim() || saving}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Transfer Component Modal */}
        {showTransferModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-medium">Transfer Component</h3>
                <button
                  onClick={() => setShowTransferModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <ArrowRightLeft size={16} className="text-blue-600" />
                    <span className="font-medium text-blue-900">Transfer "{transferComponentName}"</span>
                  </div>
                  <p className="text-sm text-blue-800">
                    This will copy {transferComponentColors.length} colors from this component to the selected palette.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Select Target Palette:</label>
                  <div className="space-y-2">
                    {palettes
                      .filter(palette => palette.id !== currentPalette)
                      .map((palette) => (
                        <button
                          key={palette.id}
                          onClick={() => handleExecuteTransfer(palette.id)}
                          className="w-full p-3 border border-gray-200 rounded-lg text-left hover:bg-gray-50 hover:border-gray-300 transition-colors group"
                          disabled={saving}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-900">{palette.name}</div>
                              <div className="text-sm text-gray-500">{palette.description || 'No description'}</div>
                            </div>
                            <ArrowRightLeft size={16} className="text-gray-400 group-hover:text-gray-600" />
                          </div>
                        </button>
                      ))}
                  </div>
                </div>

                {palettes.filter(palette => palette.id !== currentPalette).length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-2xl mb-2">📋</div>
                    <p className="text-gray-500">No other palettes available for transfer.</p>
                    <p className="text-sm text-gray-400 mt-1">Create additional palettes to enable component transfer.</p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Screenshot Tooltip */}
        {hoveredComponent && (
          <div
            className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full"
            style={{
              left: tooltipPosition.x,
              top: tooltipPosition.y,
            }}
          >
            <div className="bg-white rounded-lg border border-gray-200 p-3 max-w-xs">
              <div className="text-sm font-normal text-gray-800 mb-2">{hoveredComponent.name}</div>
              <img
                src={hoveredComponent.screenshot}
                alt={`Screenshot of ${hoveredComponent.name}`}
                className="w-full h-auto rounded border max-h-48 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div
                className="w-full h-32 bg-gray-100 rounded border hidden items-center justify-center text-gray-500 text-sm"
              >
                Screenshot not available
              </div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                <div className="w-3 h-3 bg-white border-b border-r border-gray-200 transform rotate-45"></div>
              </div>
            </div>
          </div>
        )}

        {/* Add Color Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-medium">Add New Color</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-normal text-gray-700 mb-1.5">Color Name</label>
                  <input
                    type="text"
                    value={newColor.name}
                    onChange={(e) => setNewColor({ ...newColor, name: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                    placeholder="e.g., Primary Blue"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-normal text-gray-700 mb-1.5">Token Name (Auto-generated)</label>
                  <div className="w-full p-2.5 bg-blue-50 border border-blue-200 rounded font-mono text-sm text-blue-700">
                    {generateTokenName(newColor.property, newColor.modifiers, newColor.name) || 'Select property and modifiers'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-normal text-gray-700 mb-1.5">Hex Code</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={newColor.hex}
                      onChange={(e) => setNewColor({ ...newColor, hex: e.target.value })}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={newColor.hex}
                      onChange={(e) => setNewColor({ ...newColor, hex: e.target.value })}
                      className="flex-1 p-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-gray-900 focus:border-gray-900 font-mono"
                      placeholder="#000000"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-normal text-gray-700 mb-1.5">Property</label>
                  <select
                    value={newColor.property}
                    onChange={(e) => setNewColor({ ...newColor, property: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                  >
                    <option value="">Select property...</option>
                    {getAllProperties().slice(1).map((property) => (
                      <option key={property} value={property}>{property}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-normal text-gray-700 mb-2">Modifiers (Select multiple)</label>
                  <div className="border border-gray-300 rounded p-3 max-h-40 overflow-y-auto">
                    <div className="flex flex-wrap gap-2">
                      {getAllModifiers().slice(1).map((modifier) => (
                        <label key={modifier} className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newColor.modifiers.includes(modifier)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewColor({ 
                                  ...newColor, 
                                  modifiers: [...newColor.modifiers, modifier] 
                                });
                              } else {
                                setNewColor({ 
                                  ...newColor, 
                                  modifiers: newColor.modifiers.filter(m => m !== modifier) 
                                });
                              }
                            }}
                            className="sr-only"
                          />
                          <span className={`px-3 py-1 rounded-full text-sm font-normal transition-colors ${
                            newColor.modifiers.includes(modifier)
                              ? 'bg-gray-900 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}>
                            {modifier}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {newColor.modifiers.length > 0 && (
                    <div className="mt-2">
                      <span className="text-sm text-gray-600">Selected: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {newColor.modifiers.map((modifier, index) => (
                          <span key={index} className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                            {modifier}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-normal text-gray-700 mb-2">Component Usage</label>
                  
                  {/* Existing Components Selection */}
                  {getUniqueComponentNames().slice(1).length > 0 && (
                    <div className="mb-3">
                      <label className="block text-sm text-gray-600 mb-2">Select from existing:</label>
                      <div className="border border-gray-300 rounded p-3 max-h-32 overflow-y-auto">
                        <div className="flex flex-wrap gap-2">
                          {getUniqueComponentNames().slice(1).map((componentName) => (
                            <label key={componentName} className="flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedComponents.includes(componentName)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedComponents([...selectedComponents, componentName]);
                                  } else {
                                    setSelectedComponents(selectedComponents.filter(c => c !== componentName));
                                  }
                                }}
                                className="sr-only"
                              />
                              <span className={`px-3 py-1 rounded-full text-sm font-normal transition-colors ${
                                selectedComponents.includes(componentName)
                                  ? 'bg-gray-900 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}>
                                {componentName}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                      {selectedComponents.length > 0 && (
                        <div className="mt-2">
                          <span className="text-sm text-gray-600">Selected: </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedComponents.map((component, index) => (
                              <span key={index} className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                                {component}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* New Components Input */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Or add new:</label>
                    <input
                      type="text"
                      value={newColor.component}
                      onChange={(e) => setNewColor({ ...newColor, component: e.target.value })}
                      className="w-full p-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                      placeholder="Button, Card, Modal (comma-separated)"
                    />
                    <p className="text-xs text-gray-500 mt-1">Separate multiple components with commas</p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddColor}
                  className="flex-1 px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors"
                >
                  Next: Add Screenshots
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Screenshot Upload Modal */}
        {showScreenshotModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-medium">Add Screenshots</h3>
                <button
                  onClick={() => {
                    setShowScreenshotModal(false);
                    setCurrentUsageItems([]);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              
              <p className="text-gray-600 mb-6 text-sm">Upload screenshots for each component usage to help others see where this color is used.</p>
              
              <div className="space-y-4">
                {currentUsageItems.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-normal text-gray-800">{item.name}</h4>
                      <div className="flex items-center gap-2">
                        {item.screenshot && !item.screenshot.includes('placeholder') && (
                          <span className="text-gray-600 text-sm flex items-center gap-1">
                            <Camera size={14} />
                            Uploaded
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block w-full">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleScreenshotUpload(index, e.target.files?.[0])}
                            className="hidden"
                            disabled={uploadingScreenshots[index]}
                          />
                          <div className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors">
                            {uploadingScreenshots[index] ? (
                              <div className="flex items-center gap-2 text-gray-600">
                                <div className="animate-spin w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full"></div>
                                Uploading...
                              </div>
                            ) : (
                              <>
                                <Upload size={16} className="text-gray-500" />
                                <span className="text-sm text-gray-600">
                                  {item.screenshot && !item.screenshot.includes('placeholder') 
                                    ? 'Replace screenshot' 
                                    : 'Upload screenshot'
                                  }
                                </span>
                              </>
                            )}
                          </div>
                        </label>
                      </div>
                      
                      {item.screenshot && (
                        <div className="w-24 h-16">
                          <img
                            src={item.screenshot}
                            alt={`Preview of ${item.name}`}
                            className="w-full h-full object-cover rounded border"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowScreenshotModal(false);
                    setCurrentUsageItems([]);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFinalizeAddColor}
                  className="flex-1 px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors"
                  disabled={saving}
                >
                  Add Color
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Color Modal */}
        {showEditModal && editingColor && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-medium">Edit Color</h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setCurrentUsageItems([]);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-normal text-gray-700 mb-1.5">Color Name</label>
                  <input
                    type="text"
                    value={editingColor.name}
                    onChange={(e) => setEditingColor({ ...editingColor, name: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                    placeholder="e.g., Primary Blue"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-normal text-gray-700 mb-1.5">Token Name (Auto-generated)</label>
                  <div className="w-full p-2.5 bg-blue-50 border border-blue-200 rounded font-mono text-sm text-blue-700">
                    {generateTokenName(editingColor.property, editingColor.modifiers, editingColor.name) || 'Select property and modifiers'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-normal text-gray-700 mb-1.5">Hex Code</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={editingColor.hex}
                      onChange={(e) => setEditingColor({ ...editingColor, hex: e.target.value })}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={editingColor.hex}
                      onChange={(e) => setEditingColor({ ...editingColor, hex: e.target.value })}
                      className="flex-1 p-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-gray-900 focus:border-gray-900 font-mono"
                      placeholder="#000000"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-normal text-gray-700 mb-1.5">Property</label>
                  <select
                    value={editingColor.property}
                    onChange={(e) => setEditingColor({ ...editingColor, property: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                  >
                    <option value="">Select property...</option>
                    {getAllProperties().slice(1).map((property) => (
                      <option key={property} value={property}>{property}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-normal text-gray-700 mb-2">Modifiers (Select multiple)</label>
                  <div className="border border-gray-300 rounded p-3 max-h-40 overflow-y-auto">
                    <div className="flex flex-wrap gap-2">
                      {getAllModifiers().slice(1).map((modifier) => (
                        <label key={modifier} className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingColor.modifiers && editingColor.modifiers.includes(modifier)}
                            onChange={(e) => {
                              const currentModifiers = editingColor.modifiers || [];
                              if (e.target.checked) {
                                setEditingColor({ 
                                  ...editingColor, 
                                  modifiers: [...currentModifiers, modifier] 
                                });
                              } else {
                                setEditingColor({ 
                                  ...editingColor, 
                                  modifiers: currentModifiers.filter(m => m !== modifier) 
                                });
                              }
                            }}
                            className="sr-only"
                          />
                          <span className={`px-3 py-1 rounded-full text-sm font-normal transition-colors ${
                            editingColor.modifiers && editingColor.modifiers.includes(modifier)
                              ? 'bg-gray-900 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}>
                            {modifier}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {editingColor.modifiers && editingColor.modifiers.length > 0 && (
                    <div className="mt-2">
                      <span className="text-sm text-gray-600">Selected: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {editingColor.modifiers.map((modifier, index) => (
                          <span key={index} className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                            {modifier}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-normal text-gray-800 mb-4">Component Usage Examples & Screenshots</h4>
                <div className="space-y-4">
                  {currentUsageItems.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => {
                            const updatedItems = [...currentUsageItems];
                            updatedItems[index] = { ...item, name: e.target.value };
                            setCurrentUsageItems(updatedItems);
                          }}
                          className="font-normal text-gray-800 border-none bg-transparent focus:outline-none focus:ring-1 focus:ring-gray-900 rounded px-2 py-1"
                          placeholder="Component name"
                        />
                        <div className="flex items-center gap-2">
                          {item.screenshot && !item.screenshot.includes('placeholder') && (
                            <span className="text-gray-600 text-sm flex items-center gap-1">
                              <Camera size={14} />
                              Uploaded
                            </span>
                          )}
                          <button
                            onClick={() => {
                              setCurrentUsageItems(currentUsageItems.filter((_, i) => i !== index));
                            }}
                            className="text-red-600 hover:text-red-800 p-1"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="block w-full">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleScreenshotUpload(index, e.target.files?.[0])}
                              className="hidden"
                              disabled={uploadingScreenshots[index]}
                            />
                            <div className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors">
                              {uploadingScreenshots[index] ? (
                                <div className="flex items-center gap-2 text-gray-600">
                                  <div className="animate-spin w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full"></div>
                                  Uploading...
                                </div>
                              ) : (
                                <>
                                  <Upload size={16} className="text-gray-500" />
                                  <span className="text-sm text-gray-600">
                                    {item.screenshot && !item.screenshot.includes('placeholder') 
                                      ? 'Replace screenshot' 
                                      : 'Upload screenshot'
                                    }
                                  </span>
                                </>
                              )}
                            </div>
                          </label>
                        </div>
                        
                        {item.screenshot && (
                          <div className="w-24 h-16">
                            <img
                              src={item.screenshot}
                              alt={`Preview of ${item.name}`}
                              className="w-full h-full object-cover rounded border"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <button
                    onClick={() => {
                      setCurrentUsageItems([
                        ...currentUsageItems,
                        { 
                          name: 'New component', 
                          screenshot: `https://via.placeholder.com/300x200/${editingColor.hex.slice(1)}/ffffff?text=New+Component` 
                        }
                      ]);
                    }}
                    className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={16} />
                    Add Component Usage Example
                  </button>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleDeleteFromEdit}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center gap-2"
                  disabled={saving}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
                <div className="flex gap-2 flex-1">
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setCurrentUsageItems([]);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateColor}
                    className="flex-1 px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors"
                    disabled={saving}
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Palette Modal */}
        {showPaletteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-medium">Create New Palette</h3>
                <button
                  onClick={() => setShowPaletteModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-normal text-gray-700 mb-1.5">Palette Name</label>
                  <input
                    type="text"
                    value={newPalette.name}
                    onChange={(e) => setNewPalette({ ...newPalette, name: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                    placeholder="e.g., Mobile App, Web Platform"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-normal text-gray-700 mb-1.5">Description (Optional)</label>
                  <textarea
                    value={newPalette.description}
                    onChange={(e) => setNewPalette({ ...newPalette, description: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-gray-900 focus:border-gray-900 resize-none"
                    rows={3}
                    placeholder="Brief description of this palette's purpose..."
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowPaletteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePalette}
                  className="flex-1 px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors"
                  disabled={!newPalette.name.trim()}
                >
                  Create Palette
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Settings Modal */}
        {showSettingsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-medium">Settings</h3>
                <button
                  onClick={() => {
                    setShowSettingsModal(false);
                    setSettingsActiveTab('palettes');
                    setEditingPalette(null);
                    setDeletingPalette(null);
                    setEditingProperty(null);
                    setEditingModifier(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Settings Tabs */}
              <div className="flex gap-0 border-b border-gray-200 mb-6">
                <button
                  onClick={() => setSettingsActiveTab('palettes')}
                  className={`px-4 py-2 text-sm transition-colors ${
                    settingsActiveTab === 'palettes'
                      ? 'text-gray-900 font-medium border-b-2 border-gray-900'
                      : 'text-gray-500 hover:text-gray-700 font-normal'
                  }`}
                >
                  Palette Settings
                </button>
                <button
                  onClick={() => setSettingsActiveTab('properties')}
                  className={`px-4 py-2 text-sm transition-colors ${
                    settingsActiveTab === 'properties'
                      ? 'text-gray-900 font-medium border-b-2 border-gray-900'
                      : 'text-gray-500 hover:text-gray-700 font-normal'
                  }`}
                >
                  Property Settings
                </button>
                <button
                  onClick={() => setSettingsActiveTab('modifiers')}
                  className={`px-4 py-2 text-sm transition-colors ${
                    settingsActiveTab === 'modifiers'
                      ? 'text-gray-900 font-medium border-b-2 border-gray-900'
                      : 'text-gray-500 hover:text-gray-700 font-normal'
                  }`}
                >
                  Modifier Settings
                </button>
              </div>

              {/* Palette Settings Tab */}
              {settingsActiveTab === 'palettes' && (
                <div className="space-y-4">
                  <h4 className="font-normal text-gray-800">Manage Palettes</h4>
                  <div className="space-y-3">
                    {palettes.map((palette) => (
                      <div key={palette.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <div className="font-normal text-sm text-gray-900">{palette.name}</div>
                          <div className="text-xs text-gray-500">{palette.description || 'No description'}</div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingPalette(palette)}
                            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded transition-colors"
                            title="Rename palette"
                          >
                            <Edit size={14} />
                          </button>
                          {!['web', 'mobile', 'legacy'].includes(palette.id) && (
                            <button
                              onClick={() => setDeletingPalette(palette)}
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                              title="Delete palette"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Property Settings Tab */}
              {settingsActiveTab === 'properties' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-normal text-gray-800">Manage Properties</h4>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newPropertyName}
                        onChange={(e) => setNewPropertyName(e.target.value)}
                        placeholder="New property name"
                        className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddProperty();
                          }
                        }}
                      />
                      <button
                        onClick={handleAddProperty}
                        className="px-3 py-1.5 bg-gray-900 text-white rounded text-sm hover:bg-gray-800 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700 mb-2">Default Properties (cannot be modified)</div>
                    <div className="grid grid-cols-2 gap-2">
                      {colorProperties.slice(1).map((property) => (
                        <div key={property} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded">
                          <span className="text-sm text-gray-600">{property}</span>
                          <span className="text-xs text-gray-400">Default</span>
                        </div>
                      ))}
                    </div>
                    
                    {customProperties.length > 0 && (
                      <>
                        <div className="text-sm font-medium text-gray-700 mt-4 mb-2">Custom Properties</div>
                        <div className="grid grid-cols-2 gap-2">
                          {customProperties.map((property) => (
                            <div key={property} className="flex items-center justify-between p-2 border border-gray-200 rounded">
                              {editingProperty === property ? (
                                <input
                                  type="text"
                                  defaultValue={property}
                                  onBlur={(e) => handleRenameProperty(property, e.target.value)}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      handleRenameProperty(property, e.target.value);
                                    }
                                  }}
                                  className="text-sm border-none bg-transparent focus:outline-none focus:ring-1 focus:ring-gray-900 rounded px-1"
                                  autoFocus
                                />
                              ) : (
                                <span className="text-sm text-gray-900">{property}</span>
                              )}
                              <div className="flex gap-1">
                                <button
                                  onClick={() => setEditingProperty(property)}
                                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                                  title="Rename property"
                                >
                                  <Edit size={12} />
                                </button>
                                <button
                                  onClick={() => handleDeleteProperty(property)}
                                  className="p-1 text-red-400 hover:text-red-600 rounded"
                                  title="Delete property"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Modifier Settings Tab */}
              {settingsActiveTab === 'modifiers' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-normal text-gray-800">Manage Modifiers</h4>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newModifierName}
                        onChange={(e) => setNewModifierName(e.target.value)}
                        placeholder="New modifier name"
                        className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddModifier();
                          }
                        }}
                      />
                      <button
                        onClick={handleAddModifier}
                        className="px-3 py-1.5 bg-gray-900 text-white rounded text-sm hover:bg-gray-800 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700 mb-2">Default Modifiers (cannot be modified)</div>
                    <div className="grid grid-cols-3 gap-2">
                      {colorModifiers.slice(1).map((modifier) => (
                        <div key={modifier} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded">
                          <span className="text-sm text-gray-600">{modifier}</span>
                          <span className="text-xs text-gray-400">Default</span>
                        </div>
                      ))}
                    </div>
                    
                    {customModifiers.length > 0 && (
                      <>
                        <div className="text-sm font-medium text-gray-700 mt-4 mb-2">Custom Modifiers</div>
                        <div className="grid grid-cols-3 gap-2">
                          {customModifiers.map((modifier) => (
                            <div key={modifier} className="flex items-center justify-between p-2 border border-gray-200 rounded">
                              {editingModifier === modifier ? (
                                <input
                                  type="text"
                                  defaultValue={modifier}
                                  onBlur={(e) => handleRenameModifier(modifier, e.target.value)}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      handleRenameModifier(modifier, e.target.value);
                                    }
                                  }}
                                  className="text-sm border-none bg-transparent focus:outline-none focus:ring-1 focus:ring-gray-900 rounded px-1"
                                  autoFocus
                                />
                              ) : (
                                <span className="text-sm text-gray-900">{modifier}</span>
                              )}
                              <div className="flex gap-1">
                                <button
                                  onClick={() => setEditingModifier(modifier)}
                                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                                  title="Rename modifier"
                                >
                                  <Edit size={12} />
                                </button>
                                <button
                                  onClick={() => handleDeleteModifier(modifier)}
                                  className="p-1 text-red-400 hover:text-red-600 rounded"
                                  title="Delete modifier"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => {
                    setShowSettingsModal(false);
                    setSettingsActiveTab('palettes');
                    setEditingPalette(null);
                    setDeletingPalette(null);
                    setEditingProperty(null);
                    setEditingModifier(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Palette Modal */}
        {editingPalette && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-medium">Rename Palette</h3>
                <button
                  onClick={() => setEditingPalette(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-normal text-gray-700 mb-1.5">Palette Name</label>
                  <input
                    type="text"
                    value={editingPalette.name}
                    onChange={(e) => setEditingPalette({ ...editingPalette, name: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                    placeholder="e.g., Mobile App, Web Platform"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-normal text-gray-700 mb-1.5">Description (Optional)</label>
                  <textarea
                    value={editingPalette.description || ''}
                    onChange={(e) => setEditingPalette({ ...editingPalette, description: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-gray-900 focus:border-gray-900 resize-none"
                    rows={3}
                    placeholder="Brief description of this palette's purpose..."
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditingPalette(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRenamePalette(editingPalette.id, editingPalette.name, editingPalette.description)}
                  className="flex-1 px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors"
                  disabled={!editingPalette.name.trim()}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deletingPalette && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-medium">Delete Palette</h3>
                <button
                  onClick={() => setDeletingPalette(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700 mb-2">
                  Are you sure you want to delete <strong>"{deletingPalette.name}"</strong>?
                </p>
                <p className="text-sm text-gray-500">
                  This action cannot be undone. All colors in this palette will be permanently deleted.
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setDeletingPalette(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeletePalette(deletingPalette.id)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Delete Palette
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Comment Modal */}
        {showCommentModal && commentingColor && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-medium">Comments - {commentingColor.name}</h3>
                <button
                  onClick={() => {
                    setShowCommentModal(false);
                    setCommentingColor(null);
                    setNewComment('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Color Preview */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-4 border border-gray-200">
                <div
                  className="w-8 h-8 rounded border border-gray-200"
                  style={{ backgroundColor: commentingColor.hex }}
                ></div>
                <div>
                  <div className="font-mono text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200 inline-block">
                    {commentingColor.tokenName}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{commentingColor.hex}</div>
                </div>
              </div>

              {/* Existing Comments */}
              <div className="mb-4">
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {commentingColor.comments && commentingColor.comments.length > 0 ? (
                    commentingColor.comments.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-normal text-sm text-gray-800">{comment.author}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.text}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm italic">No comments yet</p>
                  )}
                </div>
              </div>

              {/* Add New Comment */}
              <div className="border-t pt-4">
                <label className="block text-sm font-normal text-gray-700 mb-2">Add Comment</label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 resize-none"
                  rows={3}
                  placeholder="Share your thoughts about this color token..."
                />
              </div>
              
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => {
                    setShowCommentModal(false);
                    setCommentingColor(null);
                    setNewComment('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddComment}
                  className="flex-1 px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors"
                  disabled={!newComment.trim() || saving}
                >
                  Add Comment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorDocumentationTool;
