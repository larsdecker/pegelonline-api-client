import axios from 'axios';
import { PegelOnlineApiClient } from '../src';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PegelOnlineApiClient', () => {
  beforeEach(() => {
    mockedAxios.create.mockReset();
  });

  it('uses keepAlive by default', () => {
    const instance = { defaults: {}, get: jest.fn() } as any;
    mockedAxios.create.mockImplementation(config => {
      Object.assign(instance.defaults, config);
      return instance;
    });

    const client = new PegelOnlineApiClient();

    expect(client.apiClient.defaults.httpsAgent.keepAlive).toBe(true);
  });

  it('respects keepAlive false', () => {
    const instance = { defaults: {}, get: jest.fn() } as any;
    mockedAxios.create.mockImplementation(config => {
      Object.assign(instance.defaults, config);
      return instance;
    });

    const client = new PegelOnlineApiClient({ keepAlive: false });

    expect(client.apiClient.defaults.httpsAgent.keepAlive).toBe(false);
  });

  it('returns station list', async () => {
    const data = [
      {
        uuid: '1',
        number: '001',
        shortname: 'A',
        longname: 'A',
        km: 0,
        agency: 'WSV',
        longitude: 1,
        latitude: 1,
        water: { shortname: 'W', longname: 'Water' }
      }
    ];

    const instance = {
      defaults: {},
      get: jest.fn().mockResolvedValue({ data })
    } as any;
    mockedAxios.create.mockImplementation(config => {
      Object.assign(instance.defaults, config);
      return instance;
    });

    const client = new PegelOnlineApiClient();
    const result = await client.getStationList();

    expect(instance.get).toHaveBeenCalledWith('stations.json');
    expect(result).toEqual(data);
  });

  it('returns station details', async () => {
    const uuid = 'abc';
    const data = {
      uuid,
      number: '001',
      shortname: 'A',
      longname: 'A',
      km: 0,
      agency: 'WSV',
      longitude: 1,
      latitude: 1,
      water: { shortname: 'W', longname: 'Water' }
    };

    const instance = {
      defaults: {},
      get: jest.fn().mockResolvedValue({ data })
    } as any;
    mockedAxios.create.mockImplementation(config => {
      Object.assign(instance.defaults, config);
      return instance;
    });

    const client = new PegelOnlineApiClient();
    const result = await client.getStationDetails(uuid);

    expect(instance.get).toHaveBeenCalledWith(expect.stringContaining(uuid));
    expect(result).toEqual(data);
  });

  it('throws when station detail request fails', async () => {
    const instance = {
      defaults: {},
      get: jest.fn().mockRejectedValue(new Error('fail'))
    } as any;
    mockedAxios.create.mockImplementation(config => {
      Object.assign(instance.defaults, config);
      return instance;
    });

    const client = new PegelOnlineApiClient();
    await expect(client.getStationDetails('missing')).rejects.toThrow(
      'Error while getting station'
    );
  });
});
