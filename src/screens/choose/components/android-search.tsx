import { Text as ComposeText, Host, SearchBar } from '@expo/ui/jetpack-compose';

import { AndroidEmbeddedFont, Colors, Type } from '@/theme';
import { View } from '@/tw';

type Props = {
  placeholder: string;
  onSearch: (query: string) => void;
};

export function AndroidSearch({ placeholder, onSearch }: Props) {
  // `matchContents` on HEIGHT only. Left unbounded, Host also measures width from
  // Compose, and M3 `SearchBar` is `fillMaxWidth` — it takes the parent's full
  // width and Host writes that back, swallowing the parent's padding.
  return (
    <View>
      <Host
        matchContents={{ vertical: true }}
        style={{ width: '100%' }}
        seedColor={Colors.brand.default}
        colorScheme="light"
      >
        <SearchBar onSearch={onSearch}>
          <SearchBar.Placeholder>
            <ComposeText
              color={Colors.text.placeholder}
              style={{ fontFamily: AndroidEmbeddedFont.sans, fontSize: Type.label.fontSize }}
            >
              {placeholder}
            </ComposeText>
          </SearchBar.Placeholder>
        </SearchBar>
      </Host>
    </View>
  );
}
