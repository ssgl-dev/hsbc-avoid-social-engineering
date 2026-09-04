document.addEventListener('DOMContentLoaded', function () {
  
  // Global state to track active outline
  let activeOutlineElement = null;
  
  // Global cleanup function
  function clearAllOutlines() {
    // Remove any existing overlay
    const existingOverlay = document.querySelector('.trans-outline-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }
    
    // Hide ALL visible buttons from ALL trans elements to prevent accumulation
    const allTransElements = document.querySelectorAll('.trans .signly-button');
    allTransElements.forEach(btn => {
      if (btn.style.display === 'flex' || btn.style.display === 'block' || btn.offsetParent !== null) {
        btn.style.display = 'none';
        btn.style.visibility = 'hidden';
        btn.style.opacity = '0';
        console.log('🧹 Cleaning up visible button from:', btn.parentElement?.className);
      }
    });
    
    // Clear active element
    if (activeOutlineElement) {
      // Only reset styles for non-icon elements
      const isIcon = activeOutlineElement.classList.contains('icon') || 
                     activeOutlineElement.querySelector('i, .icon, svg') || 
                     activeOutlineElement.tagName.toLowerCase() === 'i' ||
                     activeOutlineElement.getAttribute('aria-hidden') === 'true';
      
      // Check if element is in notification banner
      const isInNotificationBanner = activeOutlineElement.closest('.notification-banner') || 
                                     activeOutlineElement.classList.contains('notification-banner') ||
                                     activeOutlineElement.classList.contains('notification-banner-text') ||
                                     activeOutlineElement.closest('.notification-banner-text') ||
                                     activeOutlineElement.closest('.A-PNLINLNEMSGE-RW-ALL') ||
                                     activeOutlineElement.closest('[id*="notificationBanner"]') ||
                                     // Check if any parent has notification banner classes
                                     (activeOutlineElement.parentElement && (
                                       activeOutlineElement.parentElement.classList.contains('notification-banner-text') ||
                                       activeOutlineElement.parentElement.closest('.notification-banner') ||
                                       activeOutlineElement.parentElement.closest('.A-PNLINLNEMSGE-RW-ALL')
                                     ));
      
      // Only reset styles if it's not an icon AND not in notification banner
      if (!isIcon && !isInNotificationBanner) {
        activeOutlineElement.style.width = '';
        activeOutlineElement.style.display = '';
      }
      
      activeOutlineElement = null;
    }
  }

  // Function to hide only the button but keep the outline
  function hideButtonOnly() {
    if (activeOutlineElement) {
      const btn = activeOutlineElement.querySelector('.signly-button');
      if (btn) {
        btn.style.display = 'flex';
      }
    }
  }
  
  // Inject signly button into every .trans div
  // Only select .trans elements that don't have .trans children (to avoid nested issues)
  const transElementsForButtons = document.querySelectorAll('main .trans');
  const finalElementsForButtons = Array.from(transElementsForButtons).filter(el => {
    // Check if this element has any .trans children
    const hasTransChildren = el.querySelector('.trans');
    return !hasTransChildren; // Only keep elements that don't have .trans children
  });
  
  finalElementsForButtons.forEach(el => {
    if (!el.querySelector('.signly-button')) {
      const btn = document.createElement('div');
      btn.className = 'signly-button';
      btn.style.height = '32px';
      btn.style.width = '32px';
      btn.style.backgroundColor = '#dc3545'; // Red color
      btn.style.borderRadius = '4px';
      btn.style.display = 'none';
      btn.style.alignItems = 'center';
      btn.style.justifyContent = 'center';
      btn.style.position = 'absolute';
      
      // Smart positioning: left for card links, right for normal elements
      const isInsideCardLink = el.closest('.A-LNKC28L-RW-ALL') || el.closest('a');
      // Always position the button to the right, even for card links
      btn.style.right = '40px';
      btn.style.left = 'auto';
      if (isInsideCardLink) {
        console.log('🔗 Card link detected - positioning button to right for:', el.className);
      }
      
      btn.style.top = '50%';
      btn.style.transform = 'translateY(-50%)';
      btn.style.cursor = 'pointer';
      btn.style.zIndex = '99999';
      btn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
      btn.title = 'Play sign language translation';
      btn.setAttribute('aria-label', 'Play sign language translation');
      btn.innerHTML = `<i class="fa-solid fa-play" style="font-size:14px;color:white;line-height:1;display:block;"></i>`;
      el.style.position = 'relative';
      el.appendChild(btn);

      btn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent click from bubbling to parent elements (like links)
        e.preventDefault();  // Prevent default action (like following links)
        console.log('🎮 Play button clicked - preventing link navigation');
        showMiniPlayer(el.innerText);
      });
    }
  });

  // Find all .trans elements to make clickable and handle hover
  // Modified logic to handle different nesting patterns
  const transElements = document.querySelectorAll('main .trans');
  const finalElements = Array.from(transElements).filter(el => {
    // First check: If this is a heading/typography element, ALWAYS include it
    const isTypographyElement = el.className.includes('A-TYP') || 
                               el.className.includes('A-BBST') ||
                               el.tagName.toLowerCase().match(/^h[1-6]$/) ||
                               el.className.includes('title') ||
                               el.className.includes('heading') ||
                               el.className.includes('A-PAR') ||
                               el.className.includes('A-LST');
    
    // Typography elements are ALWAYS included, regardless of nesting
    if (isTypographyElement) {
      console.log('✅ Typography element included:', el.className, el.tagName, el.textContent?.substring(0, 50));
      return true;
    }
    
    // Check if this element has any .trans children
    const hasTransChildren = el.querySelector('.trans');
    
    // If this is a direct child of a non-trans parent, include it
    const parentHasNoTrans = el.parentElement && !el.parentElement.classList.contains('trans');
    
    // Include if:
    // - No trans children (original logic)
    // - Parent doesn't have trans class (direct child case)
    const shouldInclude = !hasTransChildren || parentHasNoTrans;
    
    if (shouldInclude) {
      console.log('✅ Non-typography element included:', el.className, 'hasTransChildren:', hasTransChildren, 'parentHasNoTrans:', parentHasNoTrans);
    } else {
      console.log('❌ Element excluded:', el.className, 'hasTransChildren:', hasTransChildren, 'parentHasNoTrans:', parentHasNoTrans);
    }
    
    return shouldInclude;
  });
  
  console.log(`🚀 Found ${transElements.length} .trans elements, filtered to ${finalElements.length} final elements`);
  
  // Debug: Check for specific typography classes
  const typographyElements = finalElements.filter(el => el.className.includes('A-TYP28L-RW-ALL'));
  console.log(`🎯 Found ${typographyElements.length} A-TYP28L-RW-ALL elements that will get play buttons:`, typographyElements);
  
  finalElements.forEach((el, idx) => {
    if (el.className.includes('A-TYP28L-RW-ALL')) {
      console.log(`📝 Processing A-TYP28L-RW-ALL element ${idx}:`, el.tagName, el.className, el.textContent?.slice(0, 50));
    }
    console.log(`🎯 Processing .trans element ${idx}:`, el.tagName, el.className, el.textContent?.slice(0, 50));
    el.classList.add('video-link');
    el.tabIndex = 0;
    el.style.cursor = 'pointer';
    el.style.position = 'relative';

    let isHovering = false;

    const showButton = (el) => {
      console.log(`📐 Hover on element:`, el.tagName, el.className, el.textContent?.slice(0, 30));
      
      // Clear any existing outlines/overlays
      clearAllOutlines();
      
      // Set this as the active element
      activeOutlineElement = el;
      isHovering = true;
      
      // Store original styles before making changes
      const originalWidth = el.style.width || '';
      const originalDisplay = el.style.display || '';
      
      // Only apply width/display changes to text elements, not icons or other special elements
      const isIcon = el.classList.contains('icon') || 
                     el.querySelector('i, .icon, svg') || 
                     el.tagName.toLowerCase() === 'i' ||
                     el.getAttribute('aria-hidden') === 'true';
      
      // Check if element is in notification banner - these should not have layout changes
      const isInNotificationBanner = el.closest('.notification-banner') || 
                                     el.classList.contains('notification-banner') ||
                                     el.classList.contains('notification-banner-text') ||
                                     el.closest('.notification-banner-text') ||
                                     el.closest('.A-PNLINLNEMSGE-RW-ALL') ||
                                     el.closest('[id*="notificationBanner"]') ||
                                     // Check if any parent has notification banner classes
                                     (el.parentElement && (
                                       el.parentElement.classList.contains('notification-banner-text') ||
                                       el.parentElement.closest('.notification-banner') ||
                                       el.parentElement.closest('.A-PNLINLNEMSGE-RW-ALL')
                                     ));
      
      // Skip width/display changes for icons AND notification banner elements
      if (!isIcon && !isInNotificationBanner) {
        // First, set the element width to fit-content to get accurate text dimensions
        el.style.width = 'fit-content';
        el.style.display = 'inline-block';
      }
      
      // Force a reflow to get accurate measurements
      el.offsetWidth;
      
      // Get the bounding rect after setting fit-content (or using original size for icons)
      const rect = el.getBoundingClientRect();
      
      const overlay = document.createElement('div');
      overlay.className = 'trans-outline-overlay';
      
      // Set all styles inline to ensure they work - ONLY the overlay, no CSS outline
      overlay.style.cssText = `
        position: fixed !important;
        left: ${rect.left - 2}px;
        top: ${rect.top - 2}px;
        width: ${rect.width + 4}px;
        height: ${rect.height + 4}px;
        border: 2px dotted #dc3545 !important;
        z-index: 2 !important;
        pointer-events: none !important;
        background: transparent !important;
        box-sizing: border-box !important;
      `;
      
      document.body.appendChild(overlay);
      
      const btn = el.querySelector('.signly-button');
      if (btn) {
        // Check if element is inside a card/tile link that might block functionality
        const isInsideCardLink = el.closest('.A-LNKC28L-RW-ALL') || el.closest('a');
        
        // Force proper positioning and visibility
        btn.style.display = 'flex';
        btn.style.position = 'absolute';
        
        // Always position the button on the right side (uniform behavior)
        btn.style.right = '-40px';
        btn.style.left = 'auto';
        
        btn.style.top = '50%';
        btn.style.transform = 'translateY(-50%)';
        btn.style.zIndex = '99999';
        btn.style.visibility = 'visible';
        btn.style.opacity = '1';
        
        // Ensure parent element has proper positioning
        el.style.position = 'relative';
        el.style.overflow = 'visible';
        
        // Ensure button is the only visible one
        console.log('✅ Button made visible for:', el.className, el.tagName);
        
        // Ensure button is always visible for typography elements and headings
        const isTypographyElement = el.className.includes('A-TYP') || 
                                   el.tagName.toLowerCase().match(/^h[1-6]$/) ||
                                   el.className.includes('A-PAR') ||
                                   el.className.includes('title') ||
                                   el.className.includes('heading') ||
                                   el.className.includes('A-BBST') ||
                                   el.className.includes('A-LST');
        
        // Check if element is inside a container that might affect positioning
        const parentContainer = el.closest('.heading, .text-container, [id*="content_"]');
        
        if (isTypographyElement) {
          // Also handle parent containers that might hide overflow
          if (parentContainer) {
            parentContainer.style.position = 'relative';
            parentContainer.style.overflow = 'visible';
            console.log('🎯 Typography button made visible with container:', el.className, el.tagName, 'Container:', parentContainer.className);
          } else {
            console.log('🎯 Typography button made visible:', el.className, el.tagName);
          }
          
          // Ensure parent element also doesn't clip
          if (el.parentElement) {
            el.parentElement.style.overflow = 'visible';
          }
        }
      }
    };

    const hideButton = (e) => {
      // Functionality disabled - button stays until hovering another element
      // The showButton function will handle clearing previous elements when hovering new ones
      
      // Original code kept for reference:
      // const relatedTarget = e.relatedTarget;
      // const btn = el.querySelector('.signly-button');
      // if (relatedTarget && (el.contains(relatedTarget) || relatedTarget === btn)) {
      //   return;
      // }
      // isHovering = false;
      // setTimeout(() => {
      //   if (!isHovering && activeOutlineElement === el) {
      //     hideButtonOnly();
      //   }
      // }, 1000);
    };

    el.addEventListener('mouseenter', () => showButton(el));
    //el.addEventListener('mouseleave', hideButton);
    
    // Keep button visible when hovering over it
    const btn = el.querySelector('.signly-button');
    if (btn) {
      // Add click handler to ensure this button also prevents link navigation
      btn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent click from bubbling to parent elements (like links)
        e.preventDefault();  // Prevent default action (like following links)
        console.log('🎮 Hover button clicked - preventing link navigation');
        showMiniPlayer(el.innerText);
      });
      
      btn.addEventListener('mouseenter', () => {
        isHovering = true;
      });
      btn.addEventListener('mouseleave', () => {
        // Functionality disabled - button stays until hovering another element
        // isHovering = false;
        // setTimeout(() => {
        //   if (!isHovering && activeOutlineElement === el) {
        //     hideButtonOnly(); // Only hide button, keep outline
        //   }
        // }, 1000);
      });
    }

    el.addEventListener('click', () => {
      // Click functionality if needed
    });
  });

  // Update overlay positions on scroll
  window.addEventListener('scroll', () => {
    const overlay = document.querySelector('.trans-outline-overlay');
    if (overlay && activeOutlineElement) {
      const rect = activeOutlineElement.getBoundingClientRect();
      overlay.style.left = (rect.left - 2) + 'px';
      overlay.style.top = (rect.top - 2) + 'px';
      overlay.style.width = (rect.width + 4) + 'px';
      overlay.style.height = (rect.height + 4) + 'px';
    }
  });
  
  // Clear outlines when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.trans')) {
      clearAllOutlines();
    }
  });

  // Add mini player container if not present
  let miniPlayer = document.getElementById('mini-video-player');
  
  // Remove existing mini player to recreate with new settings
  if (miniPlayer) {
    miniPlayer.remove();
    miniPlayer = null;
  }
  
  // Define size states: [width, height] for each size level
  const sizeStates = [
    [200, 200],  // Tiny (for testing)
    [240, 240],  // Extra Small (for testing)
    [288, 288],  // Small (minimum size for usability)
    [345.6, 345.6],  // Medium 
    [414.72, 414.72],  // Large (+20%)
  ];
  let currentSizeIndex = 0; // Start with largest size

  console.log('MAIN FILE: Loading video-player.js with size states:', sizeStates);
  
  if (!miniPlayer) {

    miniPlayer = document.createElement('div');
    miniPlayer.id = 'mini-video-player';
    miniPlayer.style.position = 'fixed';
    miniPlayer.style.bottom = '2%';
    miniPlayer.style.right = '1%';
    miniPlayer.style.width = sizeStates[currentSizeIndex][0] + 'px';
    miniPlayer.style.height = sizeStates[currentSizeIndex][1] + 'px';
    miniPlayer.style.zIndex = 1000000;
    miniPlayer.style.display = 'none';
    miniPlayer.style.color = '#333';
    miniPlayer.style.background = 'linear-gradient(145deg, #f8f9fa, #e9ecef)';
    miniPlayer.style.overflow = 'hidden';
    miniPlayer.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15), 0 4px 8px rgba(0,0,0,0.1)';
    miniPlayer.style.borderRadius = '12px';
    miniPlayer.style.border = '1px solid #dee2e6';
    miniPlayer.style.transition = 'width 0.3s ease, height 0.3s ease';
    miniPlayer.innerHTML = `
      <!-- Control buttons bar at the top level -->
      <div style="
        position:absolute;
        top:0;
        left:0;
        right:0;
        height:40px;
        background:linear-gradient(135deg, #ffffff, #f1f3f4);
        border-bottom:1px solid #d1d5db;
        border-radius:12px 12px 0 0;
        display:flex;
        align-items:center;
        justify-content:flex-end;
        padding:0 8px;
        z-index:2147483647;
        gap:4px;
        box-shadow:0 1px 3px rgba(0,0,0,0.1);
        pointer-events:auto;
      ">
        <button id="shrink-mini-player"
          style="
            background:linear-gradient(135deg, #6c757d, #5a6268);
            border:none;
            border-radius:4px;
            font-size:14px;
            font-weight:bold;
            width:24px;
            height:24px;
            display:flex;
            align-items:center;
            justify-content:center;
            cursor:pointer;
            color:white;
            transition:all 0.2s ease;
            box-shadow:0 1px 3px rgba(0,0,0,0.2);
            z-index:2147483647;
            position:relative;
            pointer-events:auto;
          "
          title="Make smaller">−</button>
        <button id="expand-mini-player"
          style="
            background:linear-gradient(135deg, #6c757d, #5a6268);
            border:none;
            border-radius:4px;
            font-size:14px;
            font-weight:bold;
            width:24px;
            height:24px;
            display:flex;
            align-items:center;
            justify-content:center;
            cursor:pointer;
            color:white;
            transition:all 0.2s ease;
            box-shadow:0 1px 3px rgba(0,0,0,0.2);
            z-index:2147483647;
            position:relative;
            pointer-events:auto;
          "
          title="Make larger">+</button>
        <button id="close-mini-player"
          style="
            background:linear-gradient(135deg, #6c757d, #5a6268);
            border:none;
            border-radius:4px;
            font-size:14px;
            font-weight:bold;
            width:24px;
            height:24px;
            display:flex;
            align-items:center;
            justify-content:center;
            cursor:pointer;
            color:white;
            transition:all 0.2s ease;
            box-shadow:0 1px 3px rgba(0,0,0,0.2);
            z-index:2147483647;
            position:relative;
            pointer-events:auto;
          "
          title="Close">×</button>
      </div>
      <!-- Video player area -->
      <div id="vlitejs-player" style="
        position:absolute;
        top:40px;
        left:0;
        right:0;
        bottom:0;
        border-radius:0 0 12px 12px;
        background:#f8f9fa;
        border-top:1px solid #e9ecef;
      "></div>
    `;
    document.body.appendChild(miniPlayer);

    // Add global debugging for mini player interactions
    miniPlayer.addEventListener('mouseover', function(e) {
      console.log('🎯 Mini player mouseover detected, target:', e.target.id || e.target.tagName);
    });
    
    miniPlayer.addEventListener('click', function(e) {
      console.log('🎯 Mini player click detected, target:', e.target.id || e.target.tagName);
      console.log('Click coordinates:', e.clientX, e.clientY);
      console.log('Element at click point:', document.elementFromPoint(e.clientX, e.clientY));
    });

    // Add global click debugging to see what's intercepting clicks
    document.addEventListener('click', function(e) {
      const rect = miniPlayer.getBoundingClientRect();
      if (e.clientX >= rect.left && e.clientX <= rect.right && 
          e.clientY >= rect.top && e.clientY <= rect.bottom) {
        console.log('🚨 GLOBAL CLICK in mini player area!');
        console.log('Clicked element:', e.target);
        console.log('Element ID:', e.target.id);
        console.log('Element classes:', e.target.className);
        console.log('Element at exact point:', document.elementFromPoint(e.clientX, e.clientY));
        console.log('All elements at point:', document.elementsFromPoint(e.clientX, e.clientY));
        
        // Try to find our buttons in the elements stack and trigger them manually
        const elementsAtPoint = document.elementsFromPoint(e.clientX, e.clientY);
        const buttonElement = elementsAtPoint.find(el => 
          el.id === 'shrink-mini-player' || 
          el.id === 'expand-mini-player' || 
          el.id === 'close-mini-player'
        );
        
        if (buttonElement) {
          console.log('🎯 Found button in stack:', buttonElement.id);
          console.log('🔧 Manually triggering button click...');
          
          // Prevent the extension from handling this click
          e.stopPropagation();
          e.preventDefault();
          
          // Manually trigger the button functionality
          if (buttonElement.id === 'shrink-mini-player') {
            console.log('🔄 Manual shrink triggered');
            if (currentSizeIndex > 0) {
              currentSizeIndex--;
              const [width, height] = sizeStates[currentSizeIndex];
              console.log('Shrinking to:', width, 'x', height);
              miniPlayer.style.width = width + 'px';
              miniPlayer.style.height = height + 'px';
              updateButtonStates();
            }
          } else if (buttonElement.id === 'expand-mini-player') {
            console.log('🔄 Manual expand triggered');
            if (currentSizeIndex < sizeStates.length - 1) {
              currentSizeIndex++;
              const [width, height] = sizeStates[currentSizeIndex];
              console.log('Expanding to:', width, 'x', height);
              miniPlayer.style.width = width + 'px';
              miniPlayer.style.height = height + 'px';
              updateButtonStates();
            }
          } else if (buttonElement.id === 'close-mini-player') {
            console.log('🔄 Manual close triggered');
            miniPlayer.style.display = 'none';
            document.getElementById('vlitejs-player').innerHTML = '';
            currentSizeIndex = 0;
            const [width, height] = sizeStates[currentSizeIndex];
            miniPlayer.style.width = width + 'px';
            miniPlayer.style.height = height + 'px';
            updateButtonStates();
          }
        }
      }
    }, true); // Use capture phase to catch all clicks

    // Function to update button states based on current size
    function updateButtonStates() {
      const shrinkBtn = document.getElementById('shrink-mini-player');
      const expandBtn = document.getElementById('expand-mini-player');
      
      console.log('Updating button states, currentSizeIndex:', currentSizeIndex);
      console.log('shrinkBtn found:', !!shrinkBtn, 'expandBtn found:', !!expandBtn);
      
      if (!shrinkBtn || !expandBtn) {
        console.error('Buttons not found!');
        return;
      }
      
      // Disable shrink button if at smallest size
      if (currentSizeIndex === 0) {
        shrinkBtn.style.opacity = '0.5';
        shrinkBtn.style.cursor = 'not-allowed';
        shrinkBtn.disabled = true;
      } else {
        shrinkBtn.style.opacity = '1';
        shrinkBtn.style.cursor = 'pointer';
        shrinkBtn.disabled = false;
      }
      
      // Disable expand button if at largest size
      if (currentSizeIndex === sizeStates.length - 1) {
        expandBtn.style.opacity = '0.5';
        expandBtn.style.cursor = 'not-allowed';
        expandBtn.disabled = true;
      } else {
        expandBtn.style.opacity = '1';
        expandBtn.style.cursor = 'pointer';
        expandBtn.disabled = false;
      }
    }

    // Shrink button functionality
    setTimeout(() => {
      const shrinkBtn = document.getElementById('shrink-mini-player');
      const expandBtn = document.getElementById('expand-mini-player');
      const closeBtn = document.getElementById('close-mini-player');
      
      console.log('Setting up button handlers...');
      console.log('shrinkBtn found:', !!shrinkBtn, 'expandBtn found:', !!expandBtn, 'closeBtn found:', !!closeBtn);
      
      // Add debugging for all three buttons
      [shrinkBtn, expandBtn, closeBtn].forEach((btn, index) => {
        const buttonNames = ['shrink', 'expand', 'close'];
        const buttonName = buttonNames[index];
        
        if (btn) {
          console.log(`Setting up debugging for ${buttonName} button`);
          
          // Mouse enter debugging
          btn.addEventListener('mouseenter', function(e) {
            console.log(`🖱️ HOVER START: ${buttonName} button mouseenter detected`);
            console.log(`Button position:`, btn.getBoundingClientRect());
            console.log(`Button styles:`, window.getComputedStyle(btn));
            btn.style.backgroundColor = '#ff6b6b'; // Red background on hover for visual debugging
          });
          
          // Mouse leave debugging
          btn.addEventListener('mouseleave', function(e) {
            console.log(`🖱️ HOVER END: ${buttonName} button mouseleave detected`);
            btn.style.backgroundColor = ''; // Reset background
          });
          
          // Mouse down debugging
          btn.addEventListener('mousedown', function(e) {
            console.log(`🖱️ MOUSE DOWN: ${buttonName} button mousedown detected`);
            console.log(`Event details:`, e);
            btn.style.transform = 'scale(0.95)'; // Visual feedback
          });
          
          // Mouse up debugging
          btn.addEventListener('mouseup', function(e) {
            console.log(`🖱️ MOUSE UP: ${buttonName} button mouseup detected`);
            btn.style.transform = 'scale(1)'; // Reset scale
          });
          
          // General click debugging
          btn.addEventListener('click', function(e) {
            console.log(`🔥 CLICK DETECTED: ${buttonName} button clicked!`);
            console.log(`Click event:`, e);
            console.log(`Button element:`, btn);
            console.log(`Current target:`, e.currentTarget);
            console.log(`Event target:`, e.target);
          });
        }
      });
      
      if (shrinkBtn) {
        shrinkBtn.onclick = function() {
          console.log('Shrink button clicked, currentSizeIndex:', currentSizeIndex);
          if (currentSizeIndex > 0) {
            currentSizeIndex--;
            const [width, height] = sizeStates[currentSizeIndex];
            console.log('Shrinking to:', width, 'x', height);
            miniPlayer.style.width = width + 'px';
            miniPlayer.style.height = height + 'px';
            console.log('Applied styles - width:', miniPlayer.style.width, 'height:', miniPlayer.style.height);
            updateButtonStates();
          }
        };
      }

      if (expandBtn) {
        expandBtn.onclick = function() {
          console.log('Expand button clicked, currentSizeIndex:', currentSizeIndex);
          if (currentSizeIndex < sizeStates.length - 1) {
            currentSizeIndex++;
            const [width, height] = sizeStates[currentSizeIndex];
            console.log('Expanding to:', width, 'x', height);
            miniPlayer.style.width = width + 'px';
            miniPlayer.style.height = height + 'px';
            console.log('Applied styles - width:', miniPlayer.style.width, 'height:', miniPlayer.style.height);
            updateButtonStates();
          }
        };
      }

      if (closeBtn) {
        closeBtn.onclick = function() {
          console.log('Close button clicked');
          miniPlayer.style.display = 'none';
          document.getElementById('vlitejs-player').innerHTML = '';
          // Reset to smallest size when closed
          currentSizeIndex = 0;
          const [width, height] = sizeStates[currentSizeIndex];
          miniPlayer.style.width = width + 'px';
          miniPlayer.style.height = height + 'px';
          updateButtonStates();
        };
      }

      // Initialize button states
      updateButtonStates();
    }, 100);
  }

  function showMiniPlayer(text) {
  const miniPlayer = document.getElementById('mini-video-player');
  const playerDiv = document.getElementById('vlitejs-player');
  miniPlayer.style.display = 'block';

  // Use relative URL so it works on any domain / behind reverse proxy
  fetch('/video-selector/select', {
    method: 'POST', 
    headers: {
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify({ 
      source: text
    })
  })
  .then(response => response.json())
  .then(data => {
    console.log(data); 
    const VIDEO_SOURCE = data.video_source; 
    
    playerDiv.innerHTML = `
      <video id="vlite-video"
          class="vlite-js" autoplay
          style="
          width:100%;
          height:100%;
          object-fit:cover;
          border-radius:0 0 10px 10px;
          background:#000;">
        <source src="${VIDEO_SOURCE}" type="video/webm">
      </video>
    `;
  })
  .catch(error => console.error('Error submitting data:', error));
  
  setTimeout(() => {
    const vid = document.getElementById('vlite-video');
    if (window.vLite) {
      new window.vLite('#vlite-video', {
        options: { controls: true, autoplay: true }
      });
    }
    if (vid) {
      vid.play().catch(() => {});
    }
  }, 100);
  }
});