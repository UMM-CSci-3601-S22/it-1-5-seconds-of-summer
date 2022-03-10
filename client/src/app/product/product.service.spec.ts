import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Product } from './product';
import { ProductService } from './product.service';

describe('Product service: ', () => {
  // A small collection of test products
  const testProducts: Product[] = [
    {
      _id: 'fried chicken_id',
      productName: 'fried chicken',
      description: 'Delicious fried chicken legs and wings',
      brand: 'KFC',
      category: 'deli',
      store: 'willies',
      location: 'UMM Student Center Store',
      notes: 'chicken',
      lifespan: 2,
      threshold: 23,
    },
    {
      _id: 'roasted bread_id',
      productName: 'Roasted Steak',
      description: 'Delicious roasted Bread',
      brand: 'SomeBread',
      category: 'bakery',
      store: 'coop',
      location: 'UMM Student Center Store',
      notes: 'Bread',
      lifespan: 1,
      threshold: 15,
    },
    {
      _id: 'chocolate cookies_id',
      productName: 'Chocolate Cookies',
      description: 'Delicious chocolate cookies',
      brand: 'CookieCompany',
      category: 'desserts',
      store: 'coop',
      location: 'UMM Student Center Store',
      notes: 'Cookie',
      lifespan: 5,
      threshold: 43,
    }
  ];
  let productService: ProductService;
  // These are used to mock the HTTP requests so that we (a) don't have to
  // have the server running and (b) we can check exactly which HTTP
  // requests were made to ensure that we're making the correct requests.
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    // Set up the mock handling of the HTTP requests
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    // Construct an instance of the service with the mock
    // HTTP client.
    productService = new ProductService(httpClient);
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });

  it('getProducts() calls api/product', () => {
    // Assert that the products we get from this call to getProducts()
    // should be our set of test products. Because we're subscribing
    // to the result of getProducts(), this won't actually get
    // checked until the mocked HTTP request 'returns' a response.
    // This happens when we call req.flush(testProducts) a few lines
    // down.
    productService.getProducts().subscribe(
      products => expect(products).toBe(testProducts)
    );

    // Specify that (exactly) one request will be made to the specified URL.
    const req = httpTestingController.expectOne(productService.productUrl);
    // Check that the request made to that URL was a GET request.
    expect(req.request.method).toEqual('GET');
    // Specify the content of the response to that request. This
    // triggers the subscribe above, which leads to that check
    // actually being performed.
    req.flush(testProducts);
  });

  it('getUsers() calls api/users with multiple filter parameters', () => {

    productService.getProducts({
    productName: 'fried chicken',
    description: 'Delicious fried chicken legs and wings',
    brand: 'KFC',
    category: 'deli',
    store: 'willies',
    location: 'UMM Student Center Store',
    notes: 'chicken',
    lifespan: 2,
    threshold: 23, }).subscribe(
      users => expect(users).toBe(testProducts)
    );

    // Specify that (exactly) one request will be made to the specified URL with the role parameter.
    const req = httpTestingController.expectOne(
      (request) => request.url.startsWith(productService.productUrl)
        && request.params.has('productName') && request.params.has('store') && request.params.has('threshold')
    );

    // Check that the request made to that URL was a GET request.
    expect(req.request.method).toEqual('GET');

    // Check that the role parameters are correct
    expect(req.request.params.get('productName')).toEqual('fried chicken');
    expect(req.request.params.get('store')).toEqual('willies');
    expect(req.request.params.get('threshold')).toEqual('23');

    req.flush(testProducts);
  });

  it('getUserById() calls api/users/id', () => {
    const targetProducts: Product = testProducts[1];
    const targetId: string = targetProducts._id;
    productService.getProductById(targetId).subscribe(
      user => expect(user).toBe(targetProducts)
    );

    const expectedUrl: string = productService.productUrl + '/' + targetId;
    const req = httpTestingController.expectOne(expectedUrl);
    expect(req.request.method).toEqual('GET');
    req.flush(targetProducts);
  });

  it('filterProducts() filters by productName', () => {
    expect(testProducts.length).toBe(3);
    const productName = 'd';
    expect(productService.filterProducts(testProducts, { productName }).length).toBe(2);
  });

  it('filterProducts() filters by store', () => {
    expect(testProducts.length).toBe(3);
    const productStore = 'willies';
    expect(productService.filterProducts(testProducts, { store: productStore }).length).toBe(1);
  });

  it('filterProducts() filters by productName, store, and threshold', () => {
    expect(testProducts.length).toBe(3);
    const productName = 'd';
    const productStore = 'willies';
    const productThreshold = 23;
    expect(productService.filterProducts(testProducts, { productName, store:productStore }).length).toBe(1);
  });

  it('addProduct() posts to api/products', () => {

    productService.addProduct(testProducts[1]).subscribe(
      id => expect(id).toBe('testid')
    );

    const req = httpTestingController.expectOne(productService.productUrl);

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(testProducts[1]);

    req.flush({id: 'testid'});
  });
});
