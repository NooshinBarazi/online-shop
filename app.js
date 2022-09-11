import { productsData } from "./products.js";


const cartBtn = document.querySelector('.cart-btn');
const cartModal = document.querySelector('.cart');
const backDrop = document.querySelector('.backdrop');
const closeModal = document.querySelector('.cart-item-confirm');
const productsDom = document.querySelector('.products-center');
const totalCartPrise = document.querySelector('.cart-total');
const totalItems = document.querySelector('.cart-items');
const cartContent = document.querySelector('.cart-content');
const clearCart = document.querySelector('.clear-cart');
const searchInput = document.querySelector('.nav-search');
const btnsFilter = document.querySelectorAll('.btn');

let cart = [];
let btnsDom = [];
let allProductsData = [];
let filters ={
  searchItem: ''
}

//1. get data

class Products {
  static getData() {
    allProductsData = productsData
    return allProductsData;
  }
}

//2. show with ui
class UI {
  displayData(products, filter) {
    const productFilter = products.filter(p => {
        return p.title.toLowerCase().includes(filter.searchItem.toLowerCase())
    });
    let result = '';
    productsDom.innerHTML = '';
    productFilter.forEach(p => {
        result += `
    <div class="product-item">
        <div ><img src=${p.image} class="product-img"></div>
        <div class="product-des">
            <span class="product-title">${p.title}</span>
            <span class="product-price">${p.price} $</span>
        </div>
        <button class="btn add-to-cart" data-id=${p.id}>Add to cart</button>
    </div>`
    })
    productsDom.innerHTML = result;
}
  getCartBtns() {
    const addToCartBtns = [...document.querySelectorAll('.add-to-cart')];
    btnsDom = addToCartBtns;
    // console.log(addToCartBtns)
    addToCartBtns.forEach(btn => {
      const id = btn.dataset.id;
      //console.log(id)
      const isInCart = cart.find(item => item.id === parseInt(id));
      if (isInCart) {
        btn.innerHTML = "In Cart";
        btn.disabled = true;
      }
      btn.addEventListener('click', (event) => {
        event.target.innerHTML = "In Cart";
        event.target.disabled = true;


        //1. get product
        const addedProduct = { ...Storage.getProduct(id), quantity: 1 };
        //2. add to cart
        cart = [...cart, addedProduct]
        console.log(cart)
        //3. save to local storage
        Storage.saveCart(cart);
        //4.update cart value
        this.setCartValue(cart);
        //5. add to cart item
        this.addCartItem(addedProduct);

      })
    })

  }
  setCartValue(cart) {
    let tempCartItems = 0;
    const totalPrise = cart.reduce((pre, curr) => {
      tempCartItems += curr.quantity
      return pre + curr.quantity * curr.price
    }, 0);
    totalCartPrise.innerHTML = `total price: ${totalPrise.toFixed(2)} $`;
    totalItems.innerHTML = tempCartItems;
  }

  addCartItem(cartItem) {
    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML = ` <img class="cart-item-img" src=${cartItem.image} />
      <div class="cart-item-desc">
        <h4>${cartItem.title}</h4>
        <h5>$ ${cartItem.price}</h5>
      </div>
      <div class="cart-item-conteoller">
        <i class="fas fa-chevron-up" data-id = ${cartItem.id}></i>
        <p>${cartItem.quantity}</p>
        <i class="fas fa-chevron-down" data-id = ${cartItem.id}></i>
      </div>
      <i class="fas fa-trash remove-item" data-id = ${cartItem.id}></i>`;

    cartContent.appendChild(div)
  }

  setupApp() {
    cart = Storage.getCart() || [];
    cart.forEach(cartItem => this.addCartItem(cartItem))
    this.setCartValue(cart);
  }

  cartLogic() {
    clearCart.addEventListener('click', () => {
      cart.forEach((cItem) => this.removeCartItem(cItem.id));
      while (cartContent.children.length) {
        cartContent.removeChild(cartContent.children[0])
      }
      closeModalFunction();
    })
    //cart functionality
    cartContent.addEventListener('click', (event) => {
      if (event.target.classList.contains('fa-chevron-up')) {
        const addQuantity = event.target;
        const id = addQuantity.dataset.id;
        const addedItem = cart.find((cItem) => cItem.id == id)
        addedItem.quantity++;
        //update total price
        this.setCartValue(cart);
        //update storage
        Storage.saveCart(cart);
        //update item quantity
        addQuantity.nextElementSibling.innerText = addedItem.quantity;
      }else if(event.target.classList.contains('fa-chevron-down')){
        const subQuantity = event.target;
        const id = subQuantity.dataset.id;
        const substractedItem = cart.find((cItem) => cItem.id == id)
        if(substractedItem.quantity === 1){
          this.removeCartItem(id);
          cartContent.removeChild(subQuantity.parentElement.parentElement)
          return
        }
        substractedItem.quantity--;
        //update total price
        this.setCartValue(cart)
        //save storage
        Storage.saveCart(cart)
        //update item cart
        subQuantity.previousElementSibling.innerText = substractedItem.quantity;
        return
      }else if(event.target.classList.contains('remove-item')){
        const removeItem = event.target;
        const id = removeItem.dataset.id;
        this.removeCartItem(id);
        cartContent.removeChild(removeItem.parentElement)

            }
    })
  }

  removeCartItem(id) {
    cart = cart.filter(cItem => {
      cItem.id !== id
    })
    this.setCartValue(cart);
    Storage.saveCart(cart);
    this.getSingleButton(id);
  }
  getSingleButton(id) {
    const singlebtn = btnsDom.find(
      (btn) => parseInt(btn.dataset.id) === parseInt(id))
    singlebtn.innerText = 'add to cart';
    singlebtn.disabled = false;
  }

  searchProduct(){
    searchInput.addEventListener('input', (e) =>{
      filters.searchItem = e.target.value;
      this.displayData(allProductsData, filters)
    })
  }

  filterdButton(){
    btnsFilter.forEach(btn => {
      btn.addEventListener('click', (e) => {
        filters.searchItem = e.target.dataset.filter;
        this.displayData(allProductsData, filters)
      })
    })
  }

}
//3. save in storage
class Storage {
  static saveData(products) {
    localStorage.setItem('products', JSON.stringify(products))
  }

  static getProduct(id) {
    const _products = JSON.parse(localStorage.getItem('products'));
    return _products.find(p => p.id === parseInt(id))
  }

  static saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart))
  }

  static getCart() {
    return JSON.parse(localStorage.getItem('cart'))
  }
}


document.addEventListener('DOMContentLoaded', () =>{
  Products.getData();
  //setup cart
  const ui = new UI();
  ui.setupApp();
  ui.displayData(productsData, filters);
  ui.getCartBtns();
  ui.cartLogic();
  ui.searchProduct();
  ui.filterdButton();
  Storage.saveData(productsData);
})


function showModalFunction() {
  backDrop.style.display = "block";
  cartModal.style.opacity = "1";
  cartModal.style.top = "20%";
}

function closeModalFunction() {
  backDrop.style.display = "none";
  cartModal.style.opacity = "0";
  cartModal.style.top = "-100%";
}

cartBtn.addEventListener("click", showModalFunction);
closeModal.addEventListener("click", closeModalFunction);
backDrop.addEventListener("click", closeModalFunction);