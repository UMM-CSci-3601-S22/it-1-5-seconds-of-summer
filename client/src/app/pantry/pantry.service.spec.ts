import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Pantry } from './pantry';
import { PantryService } from './pantry.service';

describe('Pantry service: ', () => {
  // A small collection of test pantry
  const testPantrys: Pantry[] = [
    {
      _id: 'fried chicken_id',
      prodID: 'bruh',
      date: 'May 15, 2022',
      name: 'Chris'
    },
    {
      _id: '1',
      prodID: 'cap',
      date: 'May 15, 2022',
      name: 'Peanut'
    },
    {
      _id: '2',
      prodID: 'brim',
      date: 'May 15, 2022',
      name: 'pog'
    }
  ];
  let pantryService: PantryService;
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
    pantryService = new PantryService(httpClient);
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });

  it('getPantrys() calls api/pantry', () => {
    // Assert that the pantry we get from this call to getPantrys()
    // should be our set of test pantry. Because we're subscribing
    // to the result of getPantrys(), this won't actually get
    // checked until the mocked HTTP request 'returns' a response.
    // This happens when we call req.flush(testPantrys) a few lines
    // down.
    pantryService.getPantrys().subscribe(
      pantry => expect(pantry).toBe(testPantrys)
    );

    // Specify that (exactly) one request will be made to the specified URL.
    const req = httpTestingController.expectOne(pantryService.pantryUrl);
    // Check that the request made to that URL was a GET request.
    expect(req.request.method).toEqual('GET');
    // Specify the content of the response to that request. This
    // triggers the subscribe above, which leads to that check
    // actually being performed.
    req.flush(testPantrys);
  });

  it('getPantrys() calls api/pantry with multiple filter parameters', () => {

    pantryService.getPantrys({
      prodID: 'bruh',
      date: 'May 15, 2022',
      name: 'Chris'}).subscribe(
      pantry => expect(pantry).toBe(testPantrys)
    );

    // Specify that (exactly) one request will be made to the specified URL with the role parameter.
    const req = httpTestingController.expectOne(
      (request) => request.url.startsWith(pantryService.pantryUrl)
        && request.params.has('prodID') && request.params.has('date') && request.params.has('name')
    );

    // Check that the request made to that URL was a GET request.
    expect(req.request.method).toEqual('GET');

    // Check that the role parameters are correct
    expect(req.request.params.get('prodID')).toEqual('bruh');
    expect(req.request.params.get('date')).toEqual('May 15, 2022');
    expect(req.request.params.get('name')).toEqual('Chris');

    req.flush(testPantrys);
  });

  it('getPantryById() calls api/pantry/id', () => {
    const targetPantrys: Pantry = testPantrys[1];
    const targetId: string = targetPantrys._id;
    pantryService.getPantryById(targetId).subscribe(
      pantry => expect(pantry).toBe(targetPantrys)
    );

    const expectedUrl: string = pantryService.pantryUrl + '/' + targetId;
    const req = httpTestingController.expectOne(expectedUrl);
    expect(req.request.method).toEqual('GET');
    req.flush(targetPantrys);
  });

  it('filterPantrys() filters by prodID', () => {
    expect(testPantrys.length).toBe(3);
    const pantryProdID = 'b';
    expect(pantryService.filterPantrys(testPantrys, { prodID: pantryProdID }).length).toBe(2);
  });

  it('filterPantrys() filters by date', () => {
    expect(testPantrys.length).toBe(3);
    const pantryDate = 'May 15, 2022';
    expect(pantryService.filterPantrys(testPantrys, { date: pantryDate }).length).toBe(3);
  });

  it('filterPantrys() filters by name', () => {
    expect(testPantrys.length).toBe(3);
    const pantryName = 'pog';
    expect(pantryService.filterPantrys(testPantrys, { name: pantryName }).length).toBe(1);
  });

  it('filterPantrys() filters by prodID, date, and name', () => {
    expect(testPantrys.length).toBe(3);
    const pantryProdID = 'b';
    const pantryDate = 'May 15, 2022';
    const pantryName = 'Chris';
    expect(pantryService.filterPantrys(testPantrys, { prodID: pantryProdID, date: pantryDate, name: pantryName }).length).toBe(1);
  });

  it('addPantry() posts to api/pantry', () => {

    pantryService.addPantry(testPantrys[1]).subscribe(
      id => expect(id).toBe('testid')
    );

    const req = httpTestingController.expectOne(pantryService.pantryUrl);

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(testPantrys[1]);

    req.flush({id: 'testid'});
  });
});
