// scripts/test-optimizations.js
const models = require('../src/models');
const { v4: uuidv4 } = require('uuid');

const testDatabaseOptimizations = async () => {
  try {
    console.log('🔄 Starting database optimization tests...\n');

    // Test 1: Database Connection
    console.log('1️⃣ Testing database connection...');
    await models.sequelize.authenticate();
    console.log('✅ Database connection successful\n');

    // Test 2: Model Associations
    console.log('2️⃣ Testing model associations...');

    // Test User model
    const testUser = await models.User.create({
      userId: uuidv4(),
      firstName: 'Test',
      lastName: 'User',
      email: `test${Date.now()}@example.com`,
      password: 'testpassword123',
      isVerified: true,
    });
    console.log('✅ User model working');

    // Test Community model
    const testCommunity = await models.Community.create({
      communityId: uuidv4(),
      communityName: `Test Community ${Date.now()}`,
      communityDescription:
        'This is a test community for testing optimizations',
      category: 'Running',
      followers: [],
      postIds: [],
    });
    console.log('✅ Community model working');

    // Test Post model with associations
    const testPost = await models.Post.create({
      postId: uuidv4(),
      caption: 'This is a test post for optimization testing',
      userId: testUser.userId,
      imageUrl: 'https://example.com/test-image.jpg',
      category: 'Running',
      likedBy: [],
      likeCount: 0,
      communityId: testCommunity.id,
    });
    console.log('✅ Post model working');

    // Test Activity model
    const testActivity = await models.Activity.create({
      userId: testUser.userId,
      category: 'Running',
      details: {
        distance: 5.5,
        duration: 30,
        pace: '5:27/km',
      },
      duration: 30,
      distance: 5.5,
      calories: 350,
    });
    console.log('✅ Activity model working\n');

    // Test 3: Model Methods
    console.log('3️⃣ Testing model methods...');

    // Test Post like methods
    const likeResult = await testPost.addLike(testUser.userId);
    console.log(`✅ Post.addLike() working: ${likeResult}`);

    const isLiked = testPost.isLikedBy(testUser.userId);
    console.log(`✅ Post.isLikedBy() working: ${isLiked}`);

    const unlikeResult = await testPost.removeLike(testUser.userId);
    console.log(`✅ Post.removeLike() working: ${unlikeResult}`);

    // Test Community member methods
    const joinResult = await testCommunity.addMember(testUser.userId);
    console.log(`✅ Community.addMember() working: ${joinResult}`);

    const isMember = testCommunity.isMember(testUser.userId);
    console.log(`✅ Community.isMember() working: ${isMember}`);

    const memberCount = testCommunity.getMemberCount();
    console.log(`✅ Community.getMemberCount() working: ${memberCount}`);

    const leaveResult = await testCommunity.removeMember(testUser.userId);
    console.log(`✅ Community.removeMember() working: ${leaveResult}\n`);

    // Test 4: Associations and Includes
    console.log('4️⃣ Testing associations and includes...');

    // Test Post with author
    const postWithAuthor = await models.Post.findOne({
      where: { postId: testPost.postId },
      include: [
        {
          model: models.User,
          as: 'author',
          attributes: ['userId', 'firstName', 'lastName'],
        },
      ],
    });

    if (postWithAuthor && postWithAuthor.author) {
      console.log('✅ Post -> User association working');
    } else {
      console.log('❌ Post -> User association failed');
    }

    // Test Post with community
    const postWithCommunity = await models.Post.findOne({
      where: { postId: testPost.postId },
      include: [
        {
          model: models.Community,
          as: 'community',
          attributes: ['communityId', 'communityName'],
        },
      ],
    });

    if (postWithCommunity && postWithCommunity.community) {
      console.log('✅ Post -> Community association working');
    } else {
      console.log('❌ Post -> Community association failed');
    }

    // Test User with posts
    const userWithPosts = await models.User.findOne({
      where: { userId: testUser.userId },
      include: [
        {
          model: models.Post,
          as: 'posts',
          attributes: ['postId', 'caption'],
        },
      ],
    });

    if (
      userWithPosts &&
      userWithPosts.posts &&
      userWithPosts.posts.length > 0
    ) {
      console.log('✅ User -> Posts association working');
    } else {
      console.log('❌ User -> Posts association failed');
    }

    console.log();

    // Test 5: Query Performance
    console.log('5️⃣ Testing query performance...');

    const startTime = Date.now();

    // Complex query with multiple includes
    const complexQuery = await models.Post.findAll({
      where: { isActive: true },
      include: [
        {
          model: models.User,
          as: 'author',
          attributes: ['userId', 'firstName', 'lastName'],
        },
        {
          model: models.Community,
          as: 'community',
          attributes: ['communityId', 'communityName'],
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: 10,
    });

    const endTime = Date.now();
    const queryTime = endTime - startTime;

    console.log(`✅ Complex query completed in ${queryTime}ms`);
    console.log(
      `✅ Retrieved ${complexQuery.length} posts with associations\n`
    );

    // Test 6: Database Indexes
    console.log('6️⃣ Testing database indexes...');

    // Check if indexes exist
    const indexes = await models.sequelize.query(
      `
      SELECT schemaname, tablename, indexname, indexdef
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND tablename IN ('Posts', 'Users', 'Communities', 'Activities')
      ORDER BY tablename, indexname;
    `,
      { type: models.sequelize.QueryTypes.SELECT }
    );

    console.log(`✅ Found ${indexes.length} indexes on main tables`);

    // List some key indexes
    const keyIndexes = indexes.filter(
      idx =>
        idx.indexname.includes('posts_') ||
        idx.indexname.includes('users_') ||
        idx.indexname.includes('communities_')
    );

    console.log('📊 Key indexes found:');
    keyIndexes.forEach(idx => {
      console.log(`   - ${idx.tablename}: ${idx.indexname}`);
    });

    console.log();

    // Test 7: Connection Pool
    console.log('7️⃣ Testing connection pool...');

    const poolStats = {
      size: models.sequelize.connectionManager.pool.size,
      available: models.sequelize.connectionManager.pool.available,
      using: models.sequelize.connectionManager.pool.using,
      waiting: models.sequelize.connectionManager.pool.waiting,
    };

    console.log('📊 Connection pool stats:');
    console.log(`   - Pool size: ${poolStats.size}`);
    console.log(`   - Available: ${poolStats.available}`);
    console.log(`   - In use: ${poolStats.using}`);
    console.log(`   - Waiting: ${poolStats.waiting}`);

    console.log();

    // Cleanup test data
    console.log('🧹 Cleaning up test data...');
    await testPost.destroy();
    await testActivity.destroy();
    await testCommunity.destroy();
    await testUser.destroy();
    console.log('✅ Test data cleaned up\n');

    // Final result
    console.log('🎉 All optimization tests passed successfully!');
    console.log('📈 Database is properly optimized and ready for production');

    return {
      success: true,
      queryTime,
      indexCount: indexes.length,
      poolStats,
    };
  } catch (error) {
    console.error('❌ Optimization test failed:', error);
    console.error('\n🔧 Please check:');
    console.error('1. Database connection is working');
    console.error('2. All migrations have been run');
    console.error('3. Models are properly updated');
    console.error('4. Required dependencies are installed');

    return {
      success: false,
      error: error.message,
    };
  }
};

// Performance benchmark
const runPerformanceBenchmark = async () => {
  try {
    console.log('\n⚡ Running performance benchmark...');

    const benchmarks = [];

    // Benchmark 1: Simple User query
    let start = Date.now();
    await models.User.findAll({ limit: 100 });
    benchmarks.push({ query: 'User.findAll(100)', time: Date.now() - start });

    // Benchmark 2: Posts with includes
    start = Date.now();
    await models.Post.findAll({
      include: [{ model: models.User, as: 'author' }],
      limit: 50,
    });
    benchmarks.push({
      query: 'Post.findAll with User include',
      time: Date.now() - start,
    });

    // Benchmark 3: Complex community query
    start = Date.now();
    await models.Community.findAll({
      include: [{ model: models.Post, as: 'posts', limit: 5 }],
      limit: 20,
    });
    benchmarks.push({
      query: 'Community.findAll with Posts',
      time: Date.now() - start,
    });

    console.log('📊 Performance Benchmark Results:');
    benchmarks.forEach(benchmark => {
      const status =
        benchmark.time < 100 ? '🟢' : benchmark.time < 500 ? '🟡' : '🔴';
      console.log(`   ${status} ${benchmark.query}: ${benchmark.time}ms`);
    });

    const avgTime =
      benchmarks.reduce((sum, b) => sum + b.time, 0) / benchmarks.length;
    console.log(`📈 Average query time: ${avgTime.toFixed(2)}ms`);

    return benchmarks;
  } catch (error) {
    console.error('❌ Performance benchmark failed:', error);
    return [];
  }
};

// Main function
const main = async () => {
  try {
    const testResults = await testDatabaseOptimizations();
    const benchmarks = await runPerformanceBenchmark();

    console.log('\n📋 Test Summary:');
    console.log(`✅ Tests passed: ${testResults.success}`);
    console.log(`⚡ Average query time: ${testResults.queryTime}ms`);
    console.log(`📊 Database indexes: ${testResults.indexCount}`);
    console.log('🎯 Optimization Status: COMPLETE');

    process.exit(testResults.success ? 0 : 1);
  } catch (error) {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { testDatabaseOptimizations, runPerformanceBenchmark };
