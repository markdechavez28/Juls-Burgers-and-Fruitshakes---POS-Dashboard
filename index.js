fetch("http://localhost:3000/employees")
  .then(function (response) {
    return response.json();
  })
  .then(function (employees) {
    let placeholder = document.querySelector('.employee');
    let out = "";
    let employee = employees[1];
    out += `
<p><b>${employee.name}</b></p>
<p>${employee.role}</p>
`;
    placeholder.innerHTML = out;
  });

const categoryContainer = document.getElementById('categoryContainer');
let productsData = []; // Store products data globally

async function fetchData(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

async function generateCategoryButtons(data) {
  if (!data || !Array.isArray(data)) {
    console.error('Invalid data format.');
    return;
  }

  const categories = new Set();

  data.forEach(product => {
    if (product.category) {
      categories.add(product.category);
    }
  });

  categoryContainer.innerHTML = '';

  categories.forEach(category => {
    const button = document.createElement('button');

    button.className = 'button';

    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'category';
    categoryDiv.appendChild(button);

    const categoryName = document.createElement('p');
    categoryName.className = 'category-name';
    categoryName.textContent = category;
    categoryDiv.appendChild(categoryName);

    categoryContainer.appendChild(categoryDiv);
  });
}

async function renderProducts(products) {
  let out = "";
  for (let product of products) {
    out += `
<div class="product">
<img src="${product.image}" alt="${product.item}">
<p><b>${product.item}</b></p>
<p>₱${product.price}</p>
</div>
`;
  }
  const placeholder = document.querySelector('.products');
  placeholder.innerHTML = out;
}

fetchData('http://localhost:3000/products')
  .then(data => {
    productsData = data;
    generateCategoryButtons(data);
    renderProducts(data);
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });

categoryContainer.addEventListener('click', function (event) {
  const categoryDiv = event.target.closest('.category');
  if (categoryDiv) {
    const isSelected = categoryDiv.classList.contains('selected');

    const categoryButtons = categoryContainer.querySelectorAll('.category');
    categoryButtons.forEach(button => button.classList.remove('selected'));

    if (!isSelected) {
      const categoryName = categoryDiv.querySelector('.category-name').textContent.trim(); 
      const filteredProducts = productsData.filter(product => product.category === categoryName);
      renderProducts(filteredProducts);
      categoryDiv.classList.add('selected');
    } else {
      renderProducts(productsData);
    }
  }
});

const currentTime = new Date();

const formattedTime = `${currentTime.getHours()}:${currentTime.getMinutes()}:${currentTime.getSeconds()}`;

const text3Element = document.querySelector('.text3');
if (text3Element) {
  text3Element.textContent = `Time: ${formattedTime}`;
}

function updateTime() {
  const currentTime = new Date();
  const formattedDate = `${currentTime.toLocaleString('default', { month: 'long' })} ${currentTime.getDate()}, ${currentTime.getFullYear()}`;
  const formattedTime = `${currentTime.getHours()}:${currentTime.getMinutes()}:${currentTime.getSeconds()}`;

  const text3Element = document.querySelector('.text3');
  if (text3Element) {
    text3Element.textContent = `${formattedDate} / ${formattedTime}`;
  }
}

updateTime();

setInterval(updateTime, 1000);

document.addEventListener('DOMContentLoaded', function () {
  const productContain = document.querySelector('.products');
  const ordersContainer = document.querySelector('.orders');
  const totalAmountElement = document.querySelector('.total-amount');
  const paymentInput = document.querySelector('.payment');
  const totalChangeElement = document.querySelector('.total-change');
  const orderNumberElement = document.getElementById('orderNumber');

  let selectedProduct = null; 

  let clickedItems = {};

  let deletedOrders = {};

  productContain.addEventListener('click', function (event) {
      const productDiv = event.target.closest('.product'); 
      if (productDiv) {
          const productName = productDiv.querySelector('b').textContent.trim(); 

          const productData = productsData.find(product => product.item === productName);
          if (productData) {
              if (['Fruit Shakes', 'Smoothies', 'Special Shake'].includes(productData.category)) {
                  showOptions(productData);
              } else {
                  addToOrder(productName, productData.price);
              }
          }
      }
  });

  function showOptions(productData) {
      const sizes = Object.keys(productData.sizes);
      const sizeButtons = sizes.map(size => `<button class="size-option">${size.charAt(0).toUpperCase() + size.slice(1)}</button>`).join('');
      const sizeContainer = document.createElement('div');
      sizeContainer.classList.add('size-container');
      sizeContainer.innerHTML = `<div class="popup-content">
  <span class="close-popup">&times;</span>
  <p>Select Size:</p>
  ${sizeButtons}
  </div>`;

      productContain.appendChild(sizeContainer);

      selectedProduct = productData;
  }

  productContain.addEventListener('click', function (event) {
      const target = event.target;
      if (target.classList.contains('size-option')) {
          const selectedSize = target.textContent.trim();
          addToOrder(selectedProduct.item, selectedProduct.price, selectedSize);

          const sizeContainer = target.closest('.size-container');
          if (sizeContainer) {
              sizeContainer.remove();
          }
      }
  });

  productContain.addEventListener('click', function (event) {
      const closePopup = event.target.closest('.close-popup');
      if (closePopup) {
          const popup = closePopup.closest('.size-container');
          if (popup) {
              popup.remove();
          }
      }
  });

  function addToOrder(productName, basePrice, selectedOption = '') {
      let totalPrice = basePrice;
      if (selectedOption) {
          if (selectedProduct.category === 'Sides') {
              totalPrice += selectedProduct.flavors[selectedOption.toLowerCase()];
          } else {
              totalPrice += selectedProduct.sizes[selectedOption.toLowerCase()];
          }
      }

      const key = selectedOption ? `${productName} - ${selectedOption}` : productName;

      clickedItems[key] = (clickedItems[key] || 0) + 1;

      const total = clickedItems[key] * totalPrice;

      updateOrderedProduct();

      const orderNumber = localStorage.getItem('orderNumber');
      const productInfo = `${orderNumber ? `Order ${orderNumber} - ` : ''}${productName}`;

      console.log(productInfo);
  }

  function updateOrderedProduct() {
      ordersContainer.innerHTML = '';

      Object.keys(clickedItems).forEach(key => {
          const [productName, selectedSize] = key.split(' - ');
          const quantity = clickedItems[key];
          const productData = productsData.find(product => product.item === productName);
          const basePrice = productData.price;
          let size = selectedSize ? selectedSize.charAt(0).toUpperCase() + selectedSize.slice(1) : ''; // Capitalize the first letter of the size
          let sizePrice = 0;
          if (selectedSize) {
              sizePrice = productData.sizes[selectedSize.toLowerCase()];
          }
          const totalPrice = (basePrice + sizePrice) * quantity;

          const orderDiv = document.createElement('div');
          orderDiv.classList.add('order-item');
          orderDiv.style.lineHeight = '8px'; 

          const productInfoDiv = document.createElement('div');
          productInfoDiv.classList.add('product-info');
          productInfoDiv.style.paddingTop = '8px'; 

          const productText = selectedSize ? `${productName} - ${size}` : productName;

          const decreaseButton = document.createElement('button');
          decreaseButton.textContent = '-';
          decreaseButton.classList.add('decrease-button');
          decreaseButton.style.marginRight = '8px'; 
          decreaseButton.addEventListener('click', function () {
              decreaseQuantity(productName, selectedSize);
          });

          const quantitySpan = document.createElement('span');
          quantitySpan.textContent = `${quantity} x`;
          quantitySpan.style.marginRight = '8px'; 

          productInfoDiv.appendChild(decreaseButton);
          productInfoDiv.appendChild(quantitySpan);
          productInfoDiv.appendChild(document.createTextNode(productText));

          const totalPriceDiv = document.createElement('div');
          totalPriceDiv.textContent = `₱${totalPrice.toFixed(2)}`;
          totalPriceDiv.classList.add('total-price');
          totalPriceDiv.style.marginTop = '-14px'; 

          orderDiv.appendChild(productInfoDiv);
          orderDiv.appendChild(totalPriceDiv);

          ordersContainer.appendChild(orderDiv);
      });

      calculateTotalAmount();

      updateChange(parseFloat(paymentInput.value), parseFloat(totalAmountElement.textContent.replace(/[^\d.]/g, '')));
  }

  function decreaseQuantity(productName, selectedSize) {
      const key = selectedSize ? `${productName} - ${selectedSize}` : productName;
      if (clickedItems[key] > 1) {
          clickedItems[key]--;
      } else {
          delete clickedItems[key];
      }
      updateOrderedProduct();
  }

  function resetOrders() {
      Object.keys(clickedItems).forEach(key => {
          deletedOrders[key] = clickedItems[key];
      });

      clickedItems = {};

      updateOrderedProduct();
  }

  function undoDeletion() {
      Object.keys(deletedOrders).forEach(key => {
          clickedItems[key] = deletedOrders[key];
      });

      deletedOrders = {};

      updateOrderedProduct();
  }

  const resetButton = document.querySelector('.reset');
  if (resetButton) {
      resetButton.addEventListener('click', resetOrders);
  }

  const undoButton = document.querySelector('.undo');
  if (undoButton) {
      undoButton.addEventListener('click', undoDeletion);
  }

  document.addEventListener('keypress', function (event) {
      if (event.key === 'Enter' || event.keyCode === 13) {
          calculateTotalAmount();
      }
  });

  function calculateTotalAmount() {
      let totalAmount = 0;

      Object.keys(clickedItems).forEach(key => {
          const [productName, selectedSize] = key.split(' - ');
          const quantity = clickedItems[key];
          const productData = productsData.find(product => product.item === productName);
          const basePrice = productData.price;
          let sizePrice = 0;
          if (selectedSize) {
              sizePrice = productData.sizes[selectedSize.toLowerCase()];
          }
          const totalPrice = (basePrice + sizePrice) * quantity;
          totalAmount += totalPrice;
      });

      if (totalAmountElement) {
          totalAmountElement.textContent = `Total Amount: ₱${totalAmount.toFixed(2)}`;
      }

      updateChange(parseFloat(paymentInput.value), parseFloat(totalAmountElement.textContent.replace(/[^\d.]/g, '')));
  }

  if (totalAmountElement) {
      totalAmountElement.addEventListener('click', function () {
          if (totalAmountElement.classList.contains('placeholder')) {
              totalAmountElement.textContent = '';
              totalAmountElement.classList.remove('placeholder');
          }
      });
  }

  if (paymentInput) {
      paymentInput.addEventListener('input', function () {
          const value = paymentInput.value;
          if (!(/^\d*\.?\d*$/.test(value))) {
              paymentInput.value = value.replace(/[^\d\.]/g, '');
          }

          updateChange(parseFloat(value), parseFloat(totalAmountElement.textContent.replace(/[^\d.]/g, '')));
      });
  }

  function updateChange(payment, totalAmount) {
      if (!isNaN(payment) && !isNaN(totalAmount)) {
          const change = payment - totalAmount;
          if (totalChangeElement) {
              totalChangeElement.textContent = `Total Change: ₱${change.toFixed(2)}`;
          }
      } else {
          if (totalChangeElement) {
              totalChangeElement.textContent = '';
          }
      }
  }

  function resetOrderNumber() {
      const currentDate = new Date();
      const currentHour = currentDate.getHours();
      const currentMinute = currentDate.getMinutes();

      if (currentHour === 0 && currentMinute === 0) {
          localStorage.setItem('orderNumber', '1');
          orderNumberElement.textContent = 'Order 1';
      }
  }

  resetOrderNumber();

  setInterval(resetOrderNumber, 60000);

  const finishButton = document.querySelector('.finish');
  if (finishButton) {
      finishButton.addEventListener('click', function () {
          sessionStorage.setItem('fromFinishButton', 'true');
          location.reload();
      });
  }

  const fromFinishButton = sessionStorage.getItem('fromFinishButton');
  if (fromFinishButton === 'true') {
      let orderNumber = localStorage.getItem('orderNumber');
      if (orderNumber) {
          orderNumber = parseInt(orderNumber);
          orderNumber++;
          localStorage.setItem('orderNumber', orderNumber.toString());
          orderNumberElement.textContent = `Order ${orderNumber}`;
      }
      sessionStorage.removeItem('fromFinishButton');
  }
});

