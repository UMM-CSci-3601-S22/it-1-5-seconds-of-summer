import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Shoppinglist } from './shoppinglist';
import { ShoppinglistService } from './shoppinglist.service';

describe('Shoppinglist service: ', () => {
  // A small collection of test shoppinglist
  const testShoppinglist: Shoppinglist[] = [
    {
      _id: '7',
      productName: 'nate',
      store: 'coop',
      quantity: 1
    },
    {
      _id: '69',
      productName: 'jack',
      store: 'willies',
      quantity: 15
    },
    {
      _id: '62267f81fc13ae223000127b',
      productName: 'Collin',
      store: 'willies',
      quantity: 12
    }
  ];
  let shoppinglistService: ShoppinglistService;
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
    shoppinglistService = new ShoppinglistService(httpClient);
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });

  it('getShoppinglist() calls api/shoppinglist', () => {
    // Assert that the shoppinglist we get from this call to getShoppinglist()
    // should be our set of test shoppinglist. Because we're subscribing
    // to the result of getShoppinglist(), this won't actually get
    // checked until the mocked HTTP request 'returns' a response.
    // This happens when we call req.flush(testShoppinglist) a few lines
    // down.
    shoppinglistService.getShoppinglists().subscribe(
      shoppinglist => expect(shoppinglist).toBe(testShoppinglist)
    );

    // Specify that (exactly) one request will be made to the specified URL.
    const req = httpTestingController.expectOne(shoppinglistService.shoppinglistUrl);
    // Check that the request made to that URL was a GET request.
    expect(req.request.method).toEqual('GET');
    // Specify the content of the response to that request. This
    // triggers the subscribe above, which leads to that check
    // actually being performed.
    req.flush(testShoppinglist);
  });

  it('getShoppinglist() calls api/shoppinglist with filter parameter \'admin\'', () => {

    shoppinglistService.getShoppinglists({ store: 'coop' }).subscribe(
      shoppinglist => expect(shoppinglist).toBe(testShoppinglist)
    );

    // Specify that (exactly) one request will be made to the specified URL with the role parameter.
    const req = httpTestingController.expectOne(
      (request) => request.url.startsWith(shoppinglistService.shoppinglistUrl) && request.params.has('store')
    );

    // Check that the request made to that URL was a GET request.
    expect(req.request.method).toEqual('GET');

    // Check that the role parameter was 'admin'
    expect(req.request.params.get('store')).toEqual('coop');

    req.flush(testShoppinglist);
  });

  it('getShoppinglist() calls api/shoppinglist with filter parameter \'age\'', () => {

    shoppinglistService.getShoppinglists({ quantity: 1 }).subscribe(
      shoppinglist => expect(shoppinglist).toBe(testShoppinglist)
    );

    // Specify that (exactly) one request will be made to the specified URL with the role parameter.
    const req = httpTestingController.expectOne(
      (request) => request.url.startsWith(shoppinglistService.shoppinglistUrl) && request.params.has('quantity')
    );

    // Check that the request made to that URL was a GET request.
    expect(req.request.method).toEqual('GET');

    // Check that the role parameter was 'admin'
    expect(req.request.params.get('quantity')).toEqual('1');

    req.flush(testShoppinglist);
  });

  // it('getShoppinglist() calls api/shoppinglist with multiple filter parameters', () => {

  //   shoppinglistService.getShoppinglists({ productName: 'jack', quantity: 15 }).subscribe(
  //     shoppinglist => expect(shoppinglist).toBe(testShoppinglist)
  //   );

  //   // Specify that (exactly) one request will be made to the specified URL with the role parameter.
  //   const req = httpTestingController.expectOne(
  //     (request) => request.url.startsWith(shoppinglistService.shoppinglistUrl)
  //        && request.params.has('productName') && request.params.has('quantity')
  //   );

  //   // Check that the request made to that URL was a GET request.
  //   expect(req.request.method).toEqual('GET');

  //   // Check that the role parameters are correct
  //   // expect(req.request.params.get('store')).toEqual('willies');
  //   expect(req.request.params.get('productName')).toEqual('jack');
  //   expect(req.request.params.get('quantity')).toEqual('15');

  //   req.flush(testShoppinglist);
  // });

  it('getShoppinglistById() calls api/shoppinglist/id', () => {
    const targetShoppinglist: Shoppinglist = testShoppinglist[1];
    const targetId: string = targetShoppinglist._id;
    shoppinglistService.getShoppinglistById(targetId).subscribe(
      shoppinglist => expect(shoppinglist).toBe(targetShoppinglist)
    );

    const expectedUrl: string = shoppinglistService.shoppinglistUrl + '/' + targetId;
    const req = httpTestingController.expectOne(expectedUrl);
    expect(req.request.method).toEqual('GET');
    req.flush(targetShoppinglist);
  });

  it('filterShoppinglist() filters by name', () => {
    expect(testShoppinglist.length).toBe(3);
    const shoppinglistName = 'a';
    expect(shoppinglistService.filterShoppinglists(testShoppinglist, { productName: shoppinglistName }).length).toBe(2);
  });

  it('filterShoppinglist() filters by company', () => {
    expect(testShoppinglist.length).toBe(3);
    const shoppinglistCompany = 1;
    expect(shoppinglistService.filterShoppinglists(testShoppinglist, { quantity: shoppinglistCompany }).length).toBe(1);
  });

  it('filterShoppinglist() filters by name and company', () => {
    expect(testShoppinglist.length).toBe(3);
    const shoppinglistCompany = 15;
    const shoppinglistName = 'jack';
    // eslint-disable-next-line max-len
    expect(shoppinglistService.filterShoppinglists(testShoppinglist, { productName: shoppinglistName, quantity: shoppinglistCompany }).length).toBe(1);
  });

  it('addShoppinglist() posts to api/shoppinglist', () => {

    shoppinglistService.addShoppinglist(testShoppinglist[1]).subscribe(
      id => expect(id).toBe('testid')
    );

    const req = httpTestingController.expectOne(shoppinglistService.shoppinglistUrl);

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(testShoppinglist[1]);

    req.flush({id: 'testid'});
  });
});
