export type TagType =
  | 'NUM_SESSION'
  | 'METHOD'
  | 'FLEXIBLE_OFFERING'
  | 'EVENING_AVAILABILITY'
  | 'LUNCH_AVAILABILITY'
  | 'WEEKEND_AVAILABILITY';

export type ProviderTag = {
  type: TagType | string;
  subType: string | null;
  text: string;
};

export type Provider = {
  userInfo: {
    firebaseUid: string;
    avatar: string | null;
  };
  userName: {
    firstName: string;
    lastName: string;
  };
  profile: {
    providerInfo: {
      /** FLOAT, and 0 for most providers — treat 0 as missing. */
      yearExperience: number | null;
      providerTitle: string | null;
    };
    providerTagInfo: {
      tags: ProviderTag[] | null;
    } | null;
  };
};

export type ProvidersPage = {
  canLoadMore: boolean;
  /** Collapses to 0 past the last page — only read it from the FIRST page. */
  totalSize: number;
  providers: Provider[];
};

export type SearchProvidersResponse = {
  searchProviders: { providers: ProvidersPage };
};
