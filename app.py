from flask import Flask, json, render_template, redirect, request, send_from_directory, session, url_for
import os
import json

app = Flask(__name__, 
            template_folder='presentation/templates',  
            static_folder='presentation/static')  

app.secret_key = 'dein_geheimer_schlüssel'  

###
def get_cart_count():
    if 'cart' in session:
        return sum(item['quantity'] for item in session['cart'])
    return 0
###

@app.route('/')
def index():
    cart_count = get_cart_count()

    try:
        with open('presentation/items/items.json', 'r') as f:
            items = json.load(f)
    except FileNotFoundError:
        items = []  
    except json.JSONDecodeError:
        items = []  

    if not items:
        items = []  

    return render_template('store.html', items=items, cart_count=cart_count)



@app.route('/store')
def store():
    cart_count = get_cart_count()
    with open('presentation/items/items.json', 'r') as f:
        items = json.load(f)
    
    return render_template('store.html', items=items, cart_count=cart_count)

@app.route('/product/<product_name>')
def product(product_name):
    cart_count = get_cart_count()
    # Lade das Produkt basierend auf dem Namen (oder einer ID)
    with open('presentation/items/items.json', 'r') as f:
        items = json.load(f)

    # Finde das Produkt mit dem übergebenen Namen
    product = next((item for item in items if item['name'].lower() == product_name.lower()), None)

    # Finde alle Produkte der gleichen Kategorie
    if product:
        category = product['category']
        same_category_products = [item for item in items if item['category'] == category]

    return render_template('product.html', cart_count=cart_count, product=product, same_category_products=same_category_products)


@app.route('/items/images/<path:filename>')
def send_image(filename):
    return send_from_directory('presentation/items/images', filename)

@app.route('/add_to_cart/<product_id>')
def add_to_cart(product_id):
    if 'cart' not in session:
        session['cart'] = []  

     
    product_found = False
    for item in session['cart']:
        if isinstance(item, dict) and 'product_id' in item:  
            if str(item['product_id']) == str(product_id):  
                item['quantity'] += 1  
                product_found = True
                break
    
    if not product_found:
        session['cart'].append({'product_id': str(product_id), 'quantity': 1})

    session.modified = True  
    return redirect(url_for('index'))  


@app.route('/remove_from_cart/<product_id>')
def remove_from_cart(product_id):
    if 'cart' in session:
        session['cart'] = [item for item in session['cart'] if isinstance(item, dict) and str(item['product_id']) != str(product_id)]
        session.modified = True  
    return redirect(url_for('cart'))


@app.route('/increase_quantity/<product_id>')
def increase_quantity(product_id):
    if 'cart' in session:
        for item in session['cart']:
            if str(item['product_id']) == str(product_id):
                item['quantity'] += 1
                break
        session.modified = True
    return redirect(url_for('cart'))

@app.route('/decrease_quantity/<product_id>')
def decrease_quantity(product_id):
    if 'cart' in session:
        for item in session['cart']:
            if str(item['product_id']) == str(product_id):
                if item['quantity'] > 1:
                    item['quantity'] -= 1
                else:
                    session['cart'].remove(item)
                break
        session.modified = True
    return redirect(url_for('cart'))


@app.route('/cart')
def cart():
    cart = session.get('cart', [])
    print(f"Session Cart: {cart}")  
    cart_count = get_cart_count()

    products = []
    total_price = 0  

    with open('presentation/items/items.json', 'r') as f:
        items = json.load(f)
        
        for item in items:
            print(f"Item: {item}")  
            for cart_item in cart:
                print(f"Cart Item: {cart_item}")  

                if isinstance(cart_item, dict) and 'product_id' in cart_item:
                    if item['id'] == int(cart_item['product_id']):  
                        quantity = cart_item['quantity']
                        price = item['price']
                        total_price += quantity * price  
                        products.append({
                            'id': item['id'],
                            'name': item['name'],
                            'image': item['image'][0],  
                            'price': price,
                            'quantity': quantity,
                            'total': quantity * price  
                        })

    return render_template('cart.html', products=products, total_price=total_price, cart_count=cart_count)

@app.route('/checkout')
def checkout():
    cart_count = get_cart_count()
    cart_items = session.get('cart', [])
    
    total_price = 0

    with open('presentation/items/items.json', 'r') as f:
        items = json.load(f)

        for item in items:
            for cart_item in cart_items:
                if isinstance(cart_item, dict) and 'product_id' in cart_item:
                    if item['id'] == int(cart_item['product_id']):
                        quantity = cart_item['quantity']
                        price = item['price']
                        total_price += quantity * price  
    return render_template('checkout.html', cart_count=cart_count, total_price=total_price)



@app.route('/submit_checkout', methods=['POST'])
def submit_checkout():
    if 'cart' not in session or not session['cart']:
        return redirect(url_for('cart'))  

    name = request.form['name']
    street = request.form['street']
    number = request.form['number']
    city = request.form['city']
    zipcode = request.form['zipcode']
    credit_card_name = request.form['credit_card_name']
    credit_card_number = request.form['credit_card_number']
    ccv = request.form['ccv']
    valid_date = request.form['valid_date']
    cart_items = session.get('cart')
    total_price = request.form.get('total_price')

    print(f"Name: {name}")
    print(f"Street: {street}")
    print(f"Number: {number}")
    print(f"City: {city}")
    print(f"Zipcode: {zipcode}")
    print(f"Credit-Card-Name: {credit_card_name}")
    print(f"Credit-Card-No: {credit_card_number}")
    print(f"Credit-Card-CCV: {ccv}")
    print(f"Credit-Card-Valid-Date: {valid_date}")
    print(f"Cart Items: {cart_items}")
    print(f"Total ammount: {total_price}")
    
    if cart_items is None:
        return redirect(url_for('cart'))  

    try:

        # Add functions
        cart_items_json = json.dumps(cart_items)


        # Delete cart if process is completed
        session.pop('cart', None)

        
        return redirect(url_for('thank_you'))
    
    except Exception as e:
        
        print(f"Error processing the checkout: {e}")
        return redirect(url_for('cart'))



@app.route('/thank_you')
def thank_you():
    cart_count = get_cart_count()
    return render_template('thank_you.html', cart_count=cart_count)


if __name__ == '__main__':
    app.run(debug=True)




###
