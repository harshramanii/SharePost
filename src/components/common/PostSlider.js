import React from 'react';
import { View, StyleSheet } from 'react-native';
import { hp, wp } from '../../helper/constants';
import PostCard from './PostCard';

const PostSlider = ({ posts, onDownload, onEdit, onShare }) => {
  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          onDownload={onDownload}
          onEdit={onEdit}
          onShare={onShare}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
    gap: hp(2),
  },
});

export default PostSlider;
